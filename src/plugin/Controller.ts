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

import {IChassisPlugin, IChassisContext, IChassisPluginOptions, Operation } from "api-service-core";
import * as k8s from '@kubernetes/client-node';
import { K8sWatcher } from "../controller/K8sWatcher";
import * as CRD from "../crds/OpenAPIs.json";
import * as _ from "lodash";
import OpenAPIPlugin from "api-service-core/lib/plugins/openapi";
import * as assert from "assert";

/**
 * ControllerPlugin
 * ---------
 * Used when a method is not found
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
export class ControllerPlugin implements IChassisPlugin {

    name: string = "controller";
    group: string = "k8s.troven.io"
    version: string = "v1alpha1"
    type: string = "OpenAPI"

    // routes: any = {};
    watcher: K8sWatcher;
    kc: k8s.KubeConfig;

    install(context: IChassisContext, _options: IChassisPluginOptions) {
        let options: any = _.extend( { crd: true, enabled: true, folder: false }, _options);
        let openapi: OpenAPIPlugin = (context.plugins.get("openapi") as any) as OpenAPIPlugin;
        assert(openapi, "openapi.plugin not loaded");
        let namespace = options.namespace || process.env.K8S_NAMESPACE;

        // set watcher URL if a namespace is found
        options.url = namespace?"/apis/"+this.group+"/"+this.version+"/namespaces/"+namespace+"/"+this.type:false;

        this.kc = new k8s.KubeConfig();
        this.kc.loadFromDefault();

        options.crd && this.createCRD(this.kc, CRD);

        this.watch(namespace, context, options);
    }

    watch(namespace: string, context: IChassisContext, options: any) {

        context.log({"code": "api:k8s:watching", "message": "watching controllers", namespace: namespace});

        try {
            this.watcher = new K8sWatcher(context, this.kc, options);
        } catch (e) {
            context.error({ code: "api:k8s:watch:failed", namespace: namespace });
        }

        let openapi:OpenAPIPlugin = context.plugins.get("openapi") as OpenAPIPlugin;
        assert(openapi, "openapi is not configured");

        this.watcher.on("added", function(iwr: IControllerResource) {
            let options: any = iwr as any;
            let operation = new Operation(context, iwr.method, iwr.path, options );
            openapi.route(operation);
            context.log({"code": "api:k8s:endpoint:added", "message": "k8s added", method: operation.actionId, resource: operation.resource, operationId: operation.operationId });
        });
    }

    createCRD(kc: k8s.KubeConfig, manifest: any): Promise<any> {
        let api: k8s.Apiextensions_v1beta1Api = kc.makeApiClient( k8s.Apiextensions_v1beta1Api);
        return api.createCustomResourceDefinition(manifest);
    }

}

