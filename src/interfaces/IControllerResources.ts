
import { IControllerClaims } from "./index";

export interface IControllerResource {
    method: string;
    path: string;
    claims: IControllerClaims;
    feature: any;
}

export interface IControllerResources {
    paths: {IContollerResource};
}


