import * as _ from "lodash";
import { OpenAPIPlugin } from "api-service-core";
import { IControllerOperation, IControllerOpenAPI } from '../interfaces';
import { IOpenAPIv3, IChassisMiddleware } from 'api-service-core/lib/interfaces';
import GenericK8sWatcher from './GenericK8sWatcher';
import IGVK from "../interfaces/IGVK";
import * as CRD from "../crds/OpenAPIs.json";
import ICRD from "../interfaces/ICRD";

export class OpenAPIsWatcher extends GenericK8sWatcher<IControllerOpenAPI> {

    gvk(): IGVK {
        return {
             group: "k8s.a6s.dev",
             version: "v1",
             type: "openapis",
             kind:"OpenAPI"
         }
     }

     getCRD(): ICRD {
         return CRD
     }

     getMiddleware(): IChassisMiddleware {
         return null;
    }


     /**
     * Check for matching GVK, then emit each operation (resource/method) so controller can process it  
     * @param action 
     * @param spec 
     */
    handleResource(action: string, spec: IControllerOpenAPI) {
        let api_spec: IOpenAPIv3 = spec.spec as any;

        // import schemas
        let openapi_plugin: OpenAPIPlugin = this.context.plugins.get("openapi") as OpenAPIPlugin;
        openapi_plugin.openapi.schemas.init(api_spec);

        openapi_plugin.openapi.index_tags(api_spec.tags);

        for(let p in api_spec.paths) {
            let methods = api_spec.paths[p];
            for(let m in methods) {
                let operation = _.extend( { resource: p, actionId: m, method: m}, methods[m]) as IControllerOperation;
                this.context.log({ "code": "k8s:endpoint", action: action, operation: operation });
                this.context.bus.emit("k8s:"+action, operation);
            }
        }
    }

}