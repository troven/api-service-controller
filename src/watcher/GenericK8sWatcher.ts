import * as k8s from '@kubernetes/client-node';
import * as _ from "lodash";
import * as RR from "recursive-readdir";
import { Vars, IChassisContext, IChassisMiddleware } from "api-service-core";
import { IResourceType } from '../interfaces';
import IGVK from '../interfaces/IGVK';
import ICRD from '../interfaces/ICRD';

export default abstract class GenericK8sWatcher<T extends IResourceType>  {
    k8s_watcher: k8s.Watch;
    context: IChassisContext;
    options: any;

    abstract gvk(): IGVK;
    abstract getCRD(): ICRD;
    abstract getMiddleware(): IChassisMiddleware;

    constructor() {
    }

    install(context: IChassisContext, kc: k8s.KubeConfig, options: any) {
        this.context = context;
        this.options = options;
        if (kc && options.namespace) {
            this.watchK8s(kc, this.getK8sWatchURL(options.namespace), options.k8s || {} );
        }

        if (options.folder) {
            this.watchFolder(options. folder);
        }

        // install middleware (if any)
        let mw = this.getMiddleware();
        if (mw != null) {
            context.middleware.set( mw );
        }
        context.log( { code: "api:watcher:installed", name: name, middleware: mw?true:false });
    }


    getK8sWatchURL(namespace: string) {
        return "/apis/"+this.gvk().group+"/"+this.gvk().version+"/namespaces/"+namespace+"/"+this.gvk().type;
    }

    /**
     * watch cluster for k8s resources matching our GVK spec (via URL)
     * @param kc 
     * @param url 
     * @param options 
     */
    watchK8s(kc: k8s.KubeConfig, url: string, options: any) {
        this.context.log({ "code": "api:watcher:k8s", url: url, options: options, gvk: this.gvk() });
        this.k8s_watcher = new k8s.Watch(kc);
        this.k8s_watcher.watch(url, options, (_action, obj) => {
            let action = _action.toLowerCase(); 
            let spec: T = obj as T;
            this.maybeHandleResource(action, spec);
        }, err => {
            this.context.error({ "code": "api:watcher:k8s:error", message: err?err.message:"empty error", gvk: this.gvk()  });
        });
    }

    /**
     * Recursve folder and load all JSON or YAML files that match our GVK spec
     * 
     * @param folder 
     */
    watchFolder(folder: string) {
        this.context.log({ "code": "api:watcher:folder", folder: folder, gvk: this.gvk()  });
        RR(folder, [], (err, files) => {
            if (!err && files) {
                _.each(files, (file) => {
                    let yaml = Vars.load(file);
                    this.context.log({ "code": "api:watcher:file", file: file, gvk: this.gvk()  });
                    this.maybeHandleResource("added", yaml as T);
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
                if (matched) matched = ( labels[key] == selectors[key] );
            }
        }
        return matched;
    }

    match_gvk(spec: T) {
        return (spec.kind == this.gvk().kind) && (spec.apiVersion == this.gvk().group+"/"+this.gvk().version);
    }

    /**
     * Check for matching GVK, then emit each operation (resource/method) so controller can process it  
     * @param action 
     * @param spec 
     */
    maybeHandleResource(action: string, spec: T) {
        let selectors = _.extend({}, this.options.labels);
        let labels = spec.metadata.labels || {};

        if (!this.match_gvk(spec)) {
            this.context.log({ "code": "api:watcher:resource:mismatch", action: action, kind: spec.kind, gvk: this.gvk(), controller: this.context.config.name, name: spec.metadata.name });
            return;
        }
        if (!this.match_selectors( labels, selectors)) {
            this.context.log({ "code": "api:watcher:resource:skipped", action: action, kind: spec.kind, gvk: this.gvk(), selectors: selectors, labels: labels, controller: this.context.config.name, name: spec.metadata.name });
            return;
        }

        this.handleResource(action, spec);
    }

    abstract handleResource(action: string, spec: T);

}