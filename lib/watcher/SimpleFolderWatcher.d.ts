import { IResourceType } from '../interfaces';
import GenericK8sWatcher from './GenericK8sWatcher';
import IGVK from '../interfaces/IGVK';
import ICRD from '../interfaces/ICRD';
export declare class SimpleFolderWatcher extends GenericK8sWatcher<IResourceType> {
    gvk(): IGVK;
    getCRD(): ICRD;
    handleResource(action: string, spec: IResourceType): void;
}
