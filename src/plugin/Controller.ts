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

import {IChassisPlugin, IChassisContext, OpenAPI, OpenAPIPlugin, Operation } from "api-service-core";
import { IControllerOperation } from "../interfaces/IControllerResources"
import * as k8s from '@kubernetes/client-node';
import { K8sWatcher } from "../controller/K8sWatcher";
import * as CRD from "../crds/OpenAPIs.json";
import * as _ from "lodash";
import { IncomingMessage } from "http";

/**
 * ControllerPlugin
 * ---------
 * Used when a method is not found
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
export class ControllerPlugin implements IChassisPlugin {

    name: string = "controller";
    // routes: any = {};
    watcher: K8sWatcher;
    kc: k8s.KubeConfig;
    plugin: OpenAPIPlugin;

    install(context: IChassisContext, _options: any) {

        let options: any = _.extend( { crd: true, enabled: true, folder: false, watcher: {}, namespace: process.env.K8S_NAMESPACE||false }, _options);

        if (_options.namespace) {
            this.install_crd(context, _options);
        }

        context.bus.on("api:start", ()=> {
            this.plugin = (context.plugins.get("openapi") as any) as OpenAPIPlugin;
            if (this.plugin) {
                this.watch(context, options);
            } else {
                context.warn({ code: "api:k8s:openapi:missing", message: "missing 'openapi' plugin", options: options });
            }
        });
    }

    install_crd(context: IChassisContext, options: any) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromDefault();

        options.crd && this.createCRD(this.kc, CRD).then( (crd) => {
            context.log({ code: "api:k8s:watch:crd", message: crd.body.metadata.name || "missing" });
        }).catch ((err)=> {
            if (err.response && err.response.body ) {
                err = err.response.body;
                if (err.code==409)
                    context.log({ code: "api:k8s:watch:crd:exist", message: err?err.message:"" });
                else
                    context.warn({ code: "api:k8s:watch:crd:failed", message: err?err.message:"", error: err });
            } else {
                context.warn({ code: "api:k8s:watch:crd:error", message: err?err.message:"", error: err });
            }
        })

    }

    watch(context: IChassisContext, options: any) {

        try {
            this.watcher = new K8sWatcher(context, this.kc, options);
        } catch (e) {
            context.error({ code: "api:k8s:watch:failed", options: options });
        }

        let openapi: OpenAPI = this.plugin.openapi;
        let self = this;

        context.bus.on("k8s:added", function(iwr: IControllerOperation) {
            let options: any = iwr as any;
            let operation = new Operation(context, iwr.actionId, iwr.resource, options );
            openapi.add(operation);
            self.plugin.route(operation);
            context.log({"code": "api:k8s:endpoint:added", "message": "k8s added", method: operation.actionId, resource: operation.resource, operationId: operation.operationId });
        });
    }

    createCRD(kc: k8s.KubeConfig, manifest: any): Promise<{ response: IncomingMessage; body: k8s.V1beta1CustomResourceDefinition; }>{
        let api: k8s.Apiextensions_v1beta1Api = kc.makeApiClient( k8s.Apiextensions_v1beta1Api);
        return api.createCustomResourceDefinition(manifest);
    }

}

