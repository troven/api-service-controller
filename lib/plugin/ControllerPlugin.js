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
Object.defineProperty(exports, "__esModule", { value: true });
const api_service_core_1 = require("api-service-core");
const k8s = require("@kubernetes/client-node");
const OpenAPIsWatcher_1 = require("../watcher/OpenAPIsWatcher");
const CRD = require("../crds/OpenAPIs.json");
const _ = require("lodash");
/**
 * ControllerPlugin
 * ---------
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
class ControllerPlugin {
    constructor() {
        this.name = "controller";
    }
    install(context, _options) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromDefault();
        let options = _.extend({ crd: true, enabled: true, folder: false, watcher: {}, namespace: process.env.K8S_NAMESPACE || '' }, _options);
        if (_options.namespace) {
            this.install_crd(context, _options);
        }
        context.bus.on("api:start", () => {
            this.plugin = context.plugins.get("openapi");
            if (this.plugin) {
                this.watch(context, options);
            }
            else {
                context.warn({ code: "api:k8s:openapi:missing", message: "missing 'openapi' plugin", options: options });
            }
        });
    }
    install_crd(context, options) {
        options.crd && this.createCRD(this.kc, CRD).then((crd) => {
            context.log({ code: "api:k8s:watch:crd", message: crd.body.metadata.name || "missing" });
        }).catch((err) => {
            if (err.response && err.response.body) {
                err = err.response.body;
                if (err.code == 409)
                    context.log({ code: "api:k8s:watch:crd:exist", message: err ? err.message : "" });
                else
                    context.warn({ code: "api:k8s:watch:crd:failed", message: err ? err.message : "", error: err });
            }
            else {
                context.warn({ code: "api:k8s:watch:crd:error", message: err ? err.message : "", error: err });
            }
        });
    }
    watch(context, options) {
        try {
            this.watcher = new OpenAPIsWatcher_1.OpenAPIsWatcher();
            this.watcher.install(context, this.kc, options);
        }
        catch (e) {
            context.error({ code: "api:k8s:watch:failed", options: options, error: e.message });
        }
        let openapi = this.plugin.openapi;
        let self = this;
        context.bus.on("k8s:added", function (iwr) {
            let op_spec = iwr;
            let operation = new api_service_core_1.Operation(context, iwr.actionId, iwr.resource, op_spec);
            // console.log("OP.ADDED: %j", op_spec);
            openapi.add(operation);
            self.plugin.route(operation);
            context.log({ "code": "api:k8s:endpoint:added", "message": "k8s added", method: operation.actionId, resource: operation.resource, operationId: operation.operationId });
        });
    }
    createCRD(kc, manifest) {
        let api = kc.makeApiClient(k8s.Apiextensions_v1beta1Api);
        return api.createCustomResourceDefinition(manifest);
    }
}
exports.ControllerPlugin = ControllerPlugin;
//# sourceMappingURL=ControllerPlugin.js.map