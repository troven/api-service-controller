export interface IResourceMeta {
    name: string;
    namespace?: string;
    labels?: any;
}
export interface IResourceType {
    apiVersion: string;
    kind: string;
    metadata: IResourceMeta;
    spec: any;
    status?: any;
    history?: any;
}
