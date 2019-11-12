import * as k8s from '@kubernetes/client-node';
import { EventEmitter } from 'events';
import * as _ from "lodash";
import * as RR from "recursive-readdir";
import { Vars, IChassisContext } from "api-service-core";
import { IControllerResources, IControllerResource, IControllerOpenAPI } from '../interfaces';

// enum WatchActions {
//     added = 'added',
//     modified = 'modified',
//     deleted = 'deleted',
// }

export class K8sWatcher extends EventEmitter {
    k8s_watcher: k8s.Watch;

    group: string = "k8s.a6s.dev"
    version: string = "v1"
    kind: string = "OpenAPI"


    constructor(protected context: IChassisContext, kc: k8s.KubeConfig, protected options: any) {
        super();


        if (options.namespace) {
            let url = "/apis/"+this.group+"/"+this.version+"/namespaces/"+options.namespace+"/"+this.kind;
            this.watchK8s(kc, url, options.k8s || {} );
        }
        if (options.folder) {
            this.watchFolder(options. folder);
        }

    }

    watchK8s(kc: k8s.KubeConfig, url: string, options: any) {
        this.context.log({ "code": "k8s:watch:url", url: url, options: options});
        this.k8s_watcher = new k8s.Watch(kc);
        this.k8s_watcher.watch(url, options, (_action, obj) => {
            let action = _action.toLowerCase(); 
            let spec: IControllerOpenAPI = obj.spec as IControllerOpenAPI;
            this.handleOpenAPISpec(action, spec);
        }, err => {
            this.context.error({ "code": "k8s:watch:url:error", message: err.message });
        });
    }

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

    handleOpenAPISpec(action: string, spec: IControllerOpenAPI) {
        let resources: IControllerResources = spec.spec;
        let selectors = _.extend({}, this.options.labels);
        let labels = spec.metadata.labels || {};

        // check we are match our CRD
        let type_matched = (spec.kind == this.kind) && (spec.apiVersion == this.group+"/"+this.version);
        let matches = type_matched && this.match_selectors( labels, selectors);
        if (!matches) {
            this.context.log({ "code": "k8s:endpoint:skipped", action: action, selectors: selectors, labels: labels, controller: this.context.config.name, paths: _.keys(resources.paths) });
            return;
        }

        for(let p in resources.paths) {
            let methods = resources.paths[p];
            for(let m in methods) {
                let r: IControllerResource = methods[m];
                let operation = _.extend( { path: p, method: m}, r);
                operation.feature.claims = _.extend({} , r.feature.claims);
                this.context.log({ "code": "k8s:endpoint", action: action, operation: operation });
                this.emit(action, operation);
            }
        }
    }

}