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

import {IChassisPlugin, IChassisContext } from "api-service-core";
import * as k8s from '@kubernetes/client-node';
import { OpenAPIsWatcher } from "../watcher/OpenAPIsWatcher";
import * as _ from "lodash";
import { UIsWatcher } from "../watcher/UIsWatcher";
import GenericK8sWatcher from "../watcher/GenericK8sWatcher";
import { IResourceType } from "../interfaces";
import ICRD from "../interfaces/ICRD";
import { IncomingMessage } from "http";

const WatcherTypes = { uis: new UIsWatcher(), apis: new OpenAPIsWatcher() }
/**
 * WatcherPlugin
 * ---------
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
export class ConfigsPlugin implements IChassisPlugin {

    name: string = "configs";
    kc: k8s.KubeConfig;
    options: any;
    // plugin: OpenAPIPlugin;
    // watcher: OpenAPIsWatcher;

    install(context: IChassisContext, _options: any) {

        this.options = _.extend({}, _options);

        _.each(this.options, async (option, name) => {
            const watcher: GenericK8sWatcher<IResourceType> = WatcherTypes[name];

            this.install_crd( context, watcher.getCRD() ).then( () => {
                context.log( { code: "api:configs:watcher", name: name, options: option, gvk: watcher.gvk() });
                watcher.install( context, this.kc, option );
            }).catch( err => {
                context.error( err );
            })
        });

        // let options: any = _.extend( { crd: true, enabled: true, folder: false, watcher: {}, namespace: process.env.K8S_NAMESPACE||'' }, _options);

        // if (_options.namespace) {
        //     this.install_crd(context, _options);
        // }

        // context.bus.on("api:start", ()=> {
        //     this.plugin = (context.plugins.get("openapi") as any) as OpenAPIPlugin;
        //     if (this.plugin) {
        //         this.watch(context, options);
        //     } else {
        //         context.warn({ code: "api:k8s:openapi:missing", message: "missing 'openapi' plugin", options: options });
        //     }
        // });
    }

    install_crd(context: IChassisContext, crd: ICRD): Promise<any> {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromDefault();
        context.log({ code: "api:configs:crd:install", crd: crd });

        return new Promise( (resolve, reject) => {
            this.createCRD(this.kc, crd).then( (crd) => {
                context.log({ code: "api:configs:crd", message: crd.body.metadata.name || "missing" });
                resolve(crd);
            }).catch ((err)=> {
                if (err.response && err.response.body ) {
                    err = err.response.body;
                    if (err.code==409) {
                        context.log({ code: "api:configs:crd:exist", message: err?err.message:"", kind: crd.kind });
                        return resolve(crd);
                    } else
                        reject({ code: "api:configs:crd:failed", message: err?err.message:"", error: err, kind: crd.kind });
                } else {
                    reject({ code: "api:configs:crd:error", message: err?err.message:"", error: err, kind: crd.kind });
                }
            })
        })
    }

    // watch(context: IChassisContext, options: any) {

    //     try {
    //         this.watcher = new OpenAPIsWatcher(context, this.kc, options);
    //     } catch (e) {
    //         context.error({ code: "api:configs:failed", options: options });
    //     }

    //     let openapi: OpenAPI = this.plugin.openapi;
    //     let self = this;

    //     context.bus.on("k8s:added", function(iwr: IControllerOperation) {
    //         let op_spec: any = iwr as any;
    //         let operation = new Operation(context, iwr.actionId, iwr.resource, op_spec );
    //         // console.log("OP.ADDED: %j", op_spec);
    //         openapi.add(operation);
    //         self.plugin.route(operation);
    //         context.log({"code": "api:k8s:endpoint:added", "message": "k8s added", method: operation.actionId, resource: operation.resource, operationId: operation.operationId });
    //     });
    // }

    createCRD(kc: k8s.KubeConfig, manifest: any): Promise<{ response: IncomingMessage; body: k8s.V1beta1CustomResourceDefinition; }>{
        let api: k8s.Apiextensions_v1beta1Api = kc.makeApiClient( k8s.Apiextensions_v1beta1Api);
        return api.createCustomResourceDefinition(manifest);
    }
}

