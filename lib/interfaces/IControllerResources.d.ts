import { IControllerClaims } from "./index";
export interface IControllerOperation {
    actionId: string;
    resource: string;
    claims: IControllerClaims;
    feature: any;
}
export interface IControllerResources {
    paths: {
        IControllerOperation: any;
    };
}
