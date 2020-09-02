import { IResourceMeta } from "./IResourceType";
export default interface ICRD {
    apiVersion: string;
    kind: string;
    metadata: IResourceMeta;
    spec: {
        group: string;
        version: string;
        names: any;
        scope: string;
        validation: any;
    };
}
