import * as k8s from '@kubernetes/client-node';
import { EventEmitter } from 'events';
import * as _ from "lodash";
import * as RR from "recursive-readdir";
import { Vars, IChassisContext } from "api-service-core";

// enum WatchActions {
//     added = 'added',
//     modified = 'modified',
//     deleted = 'deleted',
// }

export class K8sWatcher extends EventEmitter {
    k8s_watcher: k8s.Watch;

    constructor(protected context: IChassisContext,kc: k8s.KubeConfig, options: any) {
        super();
        if (options.k8s && options.url) {
            this.watchK8s(kc, options.url, options.k8s);
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
            let resources: IControllerResources = obj.spec as IControllerResources;
            this.handleEndpoint(action, resources);
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
                    this.handleEndpoint("added", yaml.spec as IControllerResources);
                });
            }
        } );
    }

    match_selectors(selectors: any, matches: any ) {
        if (!selectors) return true;
        let matched = true;
        for (const key in matches) {
            if (matches.hasOwnProperty(key)) {
                matched = matched && selectors[key] == matches[key];
            }
        }
        return matched;
    }

    handleEndpoint(action: string, resources: IControllerResources) {
        
        let selected = this.match_selectors( resources.selector, { controller: this.context.config.name });
        if (!selected) {
            this.context.log({ "code": "k8s:endpoint:skipped", action: action, selector: resources.selector, controller: this.context.config.name, paths: _.keys(resources.paths) });
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