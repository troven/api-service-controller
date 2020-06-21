/*************************************************************************
 *
 * Troven CONFIDENTIAL
 * __________________
 *
 *  (c) 2017-2020 Troven Pty Ltd
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Troven Pty Ltd and its licensors,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Troven Pty Ltd
 * and its suppliers and may be covered by International and Regional Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Troven Pty Ltd.
 */
import { IChassisPlugin, IChassisContext, OpenAPIPlugin } from "api-service-core";
import * as k8s from '@kubernetes/client-node';
import { K8sWatcher } from "../controller/K8sWatcher";
import { IncomingMessage } from "http";
/**
 * ControllerPlugin
 * ---------
 * Used when a method is not found
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
export declare class ControllerPlugin implements IChassisPlugin {
    name: string;
    watcher: K8sWatcher;
    kc: k8s.KubeConfig;
    plugin: OpenAPIPlugin;
    install(context: IChassisContext, _options: any): void;
    install_crd(context: IChassisContext, options: any): void;
    watch(context: IChassisContext, options: any): void;
    createCRD(kc: k8s.KubeConfig, manifest: any): Promise<{
        response: IncomingMessage;
        body: k8s.V1beta1CustomResourceDefinition;
    }>;
}
