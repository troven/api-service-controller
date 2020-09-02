import * as k8s from '@kubernetes/client-node';
import { IChassisContext, IChassisMiddleware } from "api-service-core";
import { IResourceType } from '../interfaces';
import IGVK from '../interfaces/IGVK';
import ICRD from '../interfaces/ICRD';
export default abstract class GenericK8sWatcher<T extends IResourceType> {
    k8s_watcher: k8s.Watch;
    context: IChassisContext;
    options: any;
    abstract gvk(): IGVK;
    abstract getCRD(): ICRD;
    abstract getMiddleware(): IChassisMiddleware;
    constructor();
    install(context: IChassisContext, kc: k8s.KubeConfig, options: any): void;
    getK8sWatchURL(namespace: string): string;
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
    match_gvk(spec: T): boolean;
    /**
     * Check for matching GVK, then emit each operation (resource/method) so controller can process it
     * @param action
     * @param spec
     */
    maybeHandleResource(action: string, spec: T): void;
    abstract handleResource(action: string, spec: T): any;
}
