import { IResourceType } from '../interfaces';
import GenericK8sWatcher from './GenericK8sWatcher';
import IGVK from '../interfaces/IGVK';
import ICRD from '../interfaces/ICRD';
import { IChassisMiddleware } from "api-service-core";
export declare class UIsWatcher extends GenericK8sWatcher<IResourceType> {
    uis: any;
    schemas: any;
    gvk(): IGVK;
    getCRD(): ICRD;
    getMiddleware(): IChassisMiddleware;
    handleResource(action: string, spec: IResourceType): void;
}
