

interface IControllerResource {
    method: string;
    path: string;
    claims: IControllerClaims;
    feature: any;
}

interface IControllerResources {
    paths: {IControllerResource};
}


