import { IControllerResources } from "./IControllerResources";
export interface IControllerOpenAPI {
    apiVersion: string;
    kind: string;
    metadata: any;
    spec: IControllerResources;
    status?: any;
    history?: any;
}
