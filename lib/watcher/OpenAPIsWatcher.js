"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const GenericK8sWatcher_1 = require("./GenericK8sWatcher");
const CRD = require("../crds/OpenAPIs.json");
class OpenAPIsWatcher extends GenericK8sWatcher_1.default {
    gvk() {
        return {
            group: "k8s.a6s.dev",
            version: "v1",
            type: "openapis",
            kind: "OpenAPI"
        };
    }
    getCRD() {
        return CRD;
    }
    getMiddleware() {
        return null;
    }
    /**
    * Check for matching GVK, then emit each operation (resource/method) so controller can process it
    * @param action
    * @param spec
    */
    handleResource(action, spec) {
        let api_spec = spec.spec;
        // import schemas
        let openapi_plugin = this.context.plugins.get("openapi");
        openapi_plugin.openapi.schemas.init(api_spec);
        openapi_plugin.openapi.index_tags(api_spec.tags);
        for (let p in api_spec.paths) {
            let methods = api_spec.paths[p];
            for (let m in methods) {
                let operation = _.extend({ resource: p, actionId: m }, methods[m]);
                this.context.log({ "code": "k8s:endpoint", action: action, operation: operation });
                this.context.bus.emit("k8s:" + action, operation);
            }
        }
    }
}
exports.OpenAPIsWatcher = OpenAPIsWatcher;
//# sourceMappingURL=OpenAPIsWatcher.js.map