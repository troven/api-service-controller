import * as k8s from '@kubernetes/client-node';
import { EventEmitter } from 'events';
import * as _ from "lodash";

// enum WatchActions {
//     added = 'added',
//     modified = 'modified',
//     deleted = 'deleted',
// }

export class ControllerWatcher extends EventEmitter {
    watcher: k8s.Watch;

    constructor(kc: k8s.KubeConfig, url: string, options: any) {
        super();
        this.watcher = new k8s.Watch(kc);

        this.watcher.watch(url, options, (_type, obj) => {
                let type = _type.toLowerCase(); 
                let resources: IControllerResources = obj.spec as IControllerResources;

                for(let p in resources.paths) {
                    let methods = resources.paths[p];
                    for(let m in methods) {
                        let r: IControllerResource = methods[m];
                        console.log("IControllerResource: %s : %s --> %j", p, m, r);
                        let operation = _.extend( { path: p, method: m}, r);
                        operation.feature.claims = _.extend({} , r.feature.claims);
                        this.handle(type, operation);
                    }
                }
            }, err => {
                if (err) {
                    console.error("watch error: %j", err); // tslint:disable-line
                }
            },
        );
    }

    handle(verb: string, iwr: IControllerResource) {
        this.emit("controller:"+verb, iwr);
    }

}