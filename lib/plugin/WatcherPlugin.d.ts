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
/// <reference types="node" />
import { IChassisPlugin, IChassisContext } from "api-service-core";
import * as k8s from '@kubernetes/client-node';
import ICRD from "../interfaces/ICRD";
import { IncomingMessage } from "http";
/**
 * WatcherPlugin
 * ---------
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
export declare class WatcherPlugin implements IChassisPlugin {
    name: string;
    kc: k8s.KubeConfig;
    options: any;
    install(context: IChassisContext, _options: any): void;
    install_crd(context: IChassisContext, crd: ICRD): Promise<any>;
    createCRD(kc: k8s.KubeConfig, manifest: any): Promise<{
        response: IncomingMessage;
        body: k8s.V1beta1CustomResourceDefinition;
    }>;
}
