import * as k8s from '@kubernetes/client-node';
import { IChassisContext } from "api-service-core";
import { IControllerOpenAPI } from '../interfaces';
export declare class K8sWatcher {
    protected context: IChassisContext;
    protected options: any;
    k8s_watcher: k8s.Watch;
    group: string;
    version: string;
    type: string;
    kind: string;
    constructor(context: IChassisContext, kc: k8s.KubeConfig, options: any);
    /**
     * watch cluster for k8s resources matching our GVK spec (via URL)
     * @param kc
     * @param url
     * @param options
     */
    watchK8s(kc: k8s.KubeConfig, url: string, options: any): void;
    /**
     * Recursve folder and load all JSON or YAML files that match our GVK spec
     *
     * @param folder
     */
    watchFolder(folder: string): void;
    /**
     * Check if labels and selectors intersect
     * @param labels
     * @param selectors
     */
    match_selectors(labels: any, selectors: any): boolean;
    /**
     * Check for matching GVK, then emit each operation (resource/method) so controller can process it
     * @param action
     * @param spec
     */
    handleOpenAPISpec(action: string, spec: IControllerOpenAPI): void;
}
