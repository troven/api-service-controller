

interface IWardenResource {
    method: string;
    path: string;
    claims: IWardenClaims;
}

interface IWardenResources {
    paths: {IWardenResource};
}


