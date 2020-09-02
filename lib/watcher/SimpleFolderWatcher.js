"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GenericK8sWatcher_1 = require("./GenericK8sWatcher");
const CRD = require("../crds/UIs.json");
class SimpleFolderWatcher extends GenericK8sWatcher_1.default {
    gvk() {
        return {
            group: "k8s.a6s.dev",
            version: "v1",
            type: "uis",
            kind: "UI"
        };
    }
    getCRD() {
        return CRD;
    }
    handleResource(action, spec) {
        this.context.log({ "code": "k8s:uis:found", action: action, controller: this.context.config.name, name: spec.metadata.name });
    }
}
exports.SimpleFolderWatcher = SimpleFolderWatcher;
//# sourceMappingURL=SimpleFolderWatcher.js.map