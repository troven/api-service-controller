/*************************************************************************
 *
 * Troven CONFIDENTIAL
 * __________________
 *
 *  (c) 2017-2019 Troven Pty Ltd
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

import {IChassisPlugin, IChassisContext, Paths, IChassisPluginOptions, Security, Operation, openapi } from "api-service-core";
import * as k8s from '@kubernetes/client-node';
import { IAPI_Watcher } from "./IAPI_Watcher";
const assert = require("assert");

/**
 * ControllerPlugin
 * ---------
 * Used when a method is not found
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
export class ControllerPlugin implements IChassisPlugin {

    name: string = "iapi";
    title: string = "Controller Plugin";
    group: string = "k8s.troven.co"
    version: string = "v1alpha1"
    type: string = "iapis"

    routes: any = {};
    watcher: IAPI_Watcher;

    install(context: IChassisContext, _options: IChassisPluginOptions) {
        assert(context.middleware, "missing middleware");
        let options: any = _options;

        let openapi_spec: openapi = context.plugins.get("openapi") as openapi;
        let security: Security = openapi_spec.spec.security || new Security(context);
        let paths: Paths = new Paths(context, security);

        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();

        let namespace = options.namespace || process.env.K8S_NAMESPACE;
        if (!namespace) throw new Error("missing iapi.namespace or K8S_NAMESPACE");

        let watch_url = "/apis/"+this.group+"/"+this.version+"/namespaces/"+namespace+"/"+this.type;

        context.log({"code": "controller:watching", "message": "watching controllers", namespace: namespace, watch: watch_url});

        try {
            this.watcher = new IAPI_Watcher(kc, watch_url, options);
        } catch (e) {
            context.error({ code: "controller:watch:failed", namespace: namespace, watch: watch_url });
        }

        this.watcher.on("controller:added", function(iwr: IControllerResource) {
            let options: any = iwr as any;
            let operation = new Operation(context, security, iwr.method, iwr.path, options );
            paths.addOperation( operation );
            context.log({"code": "controller:added", "message": "added controller", method: operation.operationId, resource: operation.feature, operationId: operation.operationId });
        });
    }

}
