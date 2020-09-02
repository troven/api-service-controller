"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const k8s = require("@kubernetes/client-node");
const OpenAPIsWatcher_1 = require("../watcher/OpenAPIsWatcher");
const _ = require("lodash");
const UIsWatcher_1 = require("../watcher/UIsWatcher");
const WatcherTypes = { uis: new UIsWatcher_1.UIsWatcher(), apis: new OpenAPIsWatcher_1.OpenAPIsWatcher() };
/**
 * WatcherPlugin
 * ---------
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
class ConfigsPlugin {
    constructor() {
        this.name = "configs";
    }
    // plugin: OpenAPIPlugin;
    // watcher: OpenAPIsWatcher;
    install(context, _options) {
        this.options = _.extend({}, _options);
        _.each(this.options, (option, name) => __awaiter(this, void 0, void 0, function* () {
            const watcher = WatcherTypes[name];
            this.install_crd(context, watcher.getCRD()).then(() => {
                context.log({ code: "api:configs:watcher", name: name, options: option, gvk: watcher.gvk() });
                watcher.install(context, this.kc, option);
            }).catch(err => {
                context.error(err);
            });
        }));
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
    install_crd(context, crd) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromDefault();
        context.log({ code: "api:configs:crd:install", crd: crd });
        return new Promise((resolve, reject) => {
            this.createCRD(this.kc, crd).then((crd) => {
                context.log({ code: "api:configs:crd", message: crd.body.metadata.name || "missing" });
                resolve(crd);
            }).catch((err) => {
                if (err.response && err.response.body) {
                    err = err.response.body;
                    if (err.code == 409) {
                        context.log({ code: "api:configs:crd:exist", message: err ? err.message : "", kind: crd.kind });
                        return resolve(crd);
                    }
                    else
                        reject({ code: "api:configs:crd:failed", message: err ? err.message : "", error: err, kind: crd.kind });
                }
                else {
                    reject({ code: "api:configs:crd:error", message: err ? err.message : "", error: err, kind: crd.kind });
                }
            });
        });
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
    createCRD(kc, manifest) {
        let api = kc.makeApiClient(k8s.Apiextensions_v1beta1Api);
        return api.createCustomResourceDefinition(manifest);
    }
}
exports.ConfigsPlugin = ConfigsPlugin;
//# sourceMappingURL=ConfigsPlugin.js.map