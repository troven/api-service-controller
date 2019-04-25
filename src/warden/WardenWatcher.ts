import * as k8s from '@kubernetes/client-node';
import { EventEmitter } from 'events';

// enum WatchActions {
//     added = 'added',
//     modified = 'modified',
//     deleted = 'deleted',
// }

export class WardenWatcher extends EventEmitter {
    watcher: k8s.Watch;

    constructor(kc: k8s.KubeConfig, url: string, options: any) {
        super();
        this.watcher = new k8s.Watch(kc);

        this.watcher.watch(url, options, (_type, obj) => {
                let type = _type.toLowerCase(); 
                let resources: IWardenResources = obj.spec as IWardenResources;

                for(let p in resources.paths) {
                    let r: IWardenResource = resources.paths[p];
                    r.path = r.path || p;
                    r.claims = r.claims || { name: "any", pattern: "*" };

                    this.handle(type, r);
                }
            }, err => {
                if (err) {
                    console.log(err); // tslint:disable-line
                }
            },
        );
    }

    handle(verb: string, iwr: IWardenResource) {
        this.emit("warden:"+verb, iwr);
    }

}