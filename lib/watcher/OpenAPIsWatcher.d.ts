import { IControllerOpenAPI } from '../interfaces';
import { IChassisMiddleware } from 'api-service-core/lib/interfaces';
import GenericK8sWatcher from './GenericK8sWatcher';
import IGVK from "../interfaces/IGVK";
import ICRD from "../interfaces/ICRD";
export declare class OpenAPIsWatcher extends GenericK8sWatcher<IControllerOpenAPI> {
    gvk(): IGVK;
    getCRD(): ICRD;
    getMiddleware(): IChassisMiddleware;
    /**
    * Check for matching GVK, then emit each operation (resource/method) so controller can process it
    * @param action
    * @param spec
    */
    handleResource(action: string, spec: IControllerOpenAPI): void;
}
