import * as k8s from '@kubernetes/client-node';
import * as _ from "lodash";
import * as RR from "recursive-readdir";
import { Vars, IChassisContext, OpenAPIPlugin } from "api-service-core";
import { IControllerOperation, IControllerOpenAPI } from '../interfaces';
import { IOpenAPIv3 } from 'api-service-core/lib/interfaces';

// enum WatchActions {
//     added = 'added',
//     modified = 'modified',
//     deleted = 'deleted',
// }

export class K8sWatcher  {
    k8s_watcher: k8s.Watch;

    // CustomResourceDefinition GVK spec
    group: string = "k8s.a6s.dev";
    version: string = "v1";
    type: string = "openapis";
    kind: string = "OpenAPI";

    constructor(protected context: IChassisContext, kc: k8s.KubeConfig, protected options: any) {
        if (kc && options.namespace) {
            let url = "/apis/"+this.group+"/"+this.version+"/namespaces/"+options.namespace+"/"+this.type;
            this.watchK8s(kc, url, options.k8s || {} );
        }

        if (options.folder) {
            this.watchFolder(options. folder);
        }
    }

    /**
     * watch cluster for k8s resources matching our GVK spec (via URL)
     * @param kc 
     * @param url 
     * @param options 
     */
    watchK8s(kc: k8s.KubeConfig, url: string, options: any) {
        this.context.log({ "code": "k8s:watch:url", url: url, options: options});
        this.k8s_watcher = new k8s.Watch(kc);
        this.k8s_watcher.watch(url, options, (_action, obj) => {
            let action = _action.toLowerCase(); 
            let spec: IControllerOpenAPI = obj as IControllerOpenAPI;
            this.handleOpenAPISpec(action, spec);
        }, err => {
            this.context.error({ "code": "k8s:watch:url:error", message: err?err.message:"empty error" });
        });
    }

    /**
     * Recursve folder and load all JSON or YAML files that match our GVK spec
     * 
     * @param folder 
     */
    watchFolder(folder: string) {
        this.context.log({ "code": "k8s:watch:folder", folder: folder });
        RR(folder, [], (err, files) => {
            if (!err && files) {
                _.each(files, (file) => {
                    let yaml = Vars.load(file);
                    this.context.log({ "code": "k8s:watch:file", file: file });
                    this.handleOpenAPISpec("added", yaml as IControllerOpenAPI);
                });
            }
        } );
    }

    /**
     * Check if labels and selectors intersect
     * @param labels 
     * @param selectors 
     */
    match_selectors(labels: any, selectors: any ) {
        if (!_.isEmpty(labels)) return true;
        if (!_.isEmpty(selectors)) return true;

        let matched = true;

        for (const key in selectors) {
            if (selectors.hasOwnProperty(key)) {
                if (matched) matched = labels[key] == selectors[key];
            }
        }
        return matched;
    }

    /**
     * Check for matching GVK, then emit each operation (resource/method) so controller can process it  
     * @param action 
     * @param spec 
     */
    handleOpenAPISpec(action: string, spec: IControllerOpenAPI) {
        let api_spec: IOpenAPIv3 = spec.spec as any;
        let selectors = _.extend({}, this.options.labels);
        let labels = spec.metadata.labels || {};

        // check we are match our CRD
        let type_matched = (spec.kind == this.kind) && (spec.apiVersion == this.group+"/"+this.version);
        let matches = type_matched && this.match_selectors( labels, selectors);
        if (!matches) {
            this.context.log({ "code": "k8s:endpoint:skipped", action: action, selectors: selectors, labels: labels, controller: this.context.config.name, paths: _.keys(api_spec.paths) });
            return;
        }

        // import schemas
        let openapi_plugin: OpenAPIPlugin = this.context.plugins.get("openapi") as OpenAPIPlugin;
        openapi_plugin.openapi.schemas.init(api_spec);

        openapi_plugin.openapi.index_tags(api_spec.tags);

        for(let p in api_spec.paths) {
            let methods = api_spec.paths[p];
            for(let m in methods) {
                let operation = _.extend( { resource: p, actionId: m}, methods[m]) as IControllerOperation;
                this.context.log({ "code": "k8s:endpoint", action: action, operation: operation });
                this.context.bus.emit("k8s:"+action, operation);
            }
        }
    }

}