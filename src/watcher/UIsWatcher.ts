import * as _ from "lodash";
import { IResourceType } from '../interfaces';
import GenericK8sWatcher from './GenericK8sWatcher';
import IGVK from '../interfaces/IGVK';
import ICRD from '../interfaces/ICRD';
import * as CRD from "../crds/UIs.json";
import { IChassisMiddleware, IOperation } from "api-service-core";
// import ptr from 'json-ptr'

export class UIsWatcher extends GenericK8sWatcher<IResourceType> {
    uis: any = {};

    gvk(): IGVK {
        return {
             group: "k8s.a6s.dev",
             version: "v1",
             type: "uis",
             kind: "UI"
         }
     }

     getCRD(): ICRD {
         return CRD;
     }

     getMiddleware(): IChassisMiddleware {
         return new UIMiddleware(this);
     }

     handleResource(action: string, spec: IResourceType) {
        this.context.log({ "code": "k8s:uis:found", action: action, controller: this.context.config.name, name: spec.metadata.name });
        this.uis[ spec.metadata.name ] = spec.spec;
    }
}

class UIMiddleware implements IChassisMiddleware {
    name: string = "ui.config";
    title?: string = "UI Config";
    defaults?: any = {};

    constructor(protected watcher: UIsWatcher) {
    }

    resolve(top: any, ui: any) {
        _.each(ui, (value: any, key: string) => {
            console.log("ui.spec: %o", key);
            if (key==="$ref") {
                const deref = this.watcher.uis[value];
                if (deref) {
                    console.log("deref[]: %s -> %o", value, deref);
                    ui = this.resolve(top, deref);
                    // delete top[value]
                    // delete ui[key]
                } else {
                    ui[key] = value;
                }
            } else if ( _.isArray( value ) ) {
                ui[key] = this.resolve(top, value)
            } else if ( _.isObject( value ) ) {
                ui[key] = this.resolve(top, value)
            } else {
                ui[key] = value;
            }
        })
        return ui;
    }


    fn( _op: IOperation, _options: any): Function {

        return (_req: any, res: any) => {
            let ui = _.cloneDeep(this.watcher.uis);
            let ui_config = _.cloneDeep( this.watcher.options.config );

            if (ui_config.routes) {
                ui_config.routes = this.resolve( ui , ui_config.routes);
                console.log("ui.routes[]: %o", ui_config.routes);
            } else {
                let ui_routes = this.resolve( ui , ui);
                ui_config.routes = [];
                console.log("ui.routes: %o", ui_routes);
                _.each(ui_routes, (r) => {
                    if (r) ui_config.routes.push(r);
                })
            }
            res.json( ui_config );
        }
    }

}