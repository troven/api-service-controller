export declare const apiVersion: string;
export declare const kind: string;
export declare namespace metadata {
    export const name: string;
}
export declare namespace spec {
    export const group: string;
    export const version: string;
    export namespace names {
        const kind_1: string;
        export { kind_1 as kind };
        export const listKind: string;
        export const plural: string;
        export const singular: string;
    }
    export const scope: string;
    export namespace validation {
        export namespace openAPIV3Schema {
            export const additionalProperties: boolean;
            export namespace properties {
                export namespace spec_1 {
                    const additionalProperties_1: boolean;
                    export { additionalProperties_1 as additionalProperties };
                    export const required: string[];
                    export namespace properties_1 {
                        export const selector: {
                            "type": string;
                            "additionalProperties": boolean;
                        };
                        export const paths: {
                            "type": string;
                            "additionalProperties": boolean;
                        };
                    }
                    export { properties_1 as properties };
                }
                export { spec_1 as spec };
            }
        }
    }
}
