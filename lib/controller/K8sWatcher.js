"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const k8s = require("@kubernetes/client-node");
const _ = require("lodash");
const RR = require("recursive-readdir");
const api_service_core_1 = require("api-service-core");
// enum WatchActions {
//     added = 'added',
//     modified = 'modified',
//     deleted = 'deleted',
// }
class K8sWatcher {
    constructor(context, kc, options) {
        this.context = context;
        this.options = options;
        // CustomResourceDefinition GVK spec
        this.group = "k8s.a6s.dev";
        this.version = "v1";
        this.type = "openapis";
        this.kind = "OpenAPI";
        if (kc && options.namespace) {
            let url = "/apis/" + this.group + "/" + this.version + "/namespaces/" + options.namespace + "/" + this.type;
            this.watchK8s(kc, url, options.k8s || {});
        }
        if (options.folder) {
            this.watchFolder(options.folder);
        }
    }
    /**
     * watch cluster for k8s resources matching our GVK spec (via URL)
     * @param kc
     * @param url
     * @param options
     */
    watchK8s(kc, url, options) {
        this.context.log({ "code": "k8s:watch:url", url: url, options: options });
        this.k8s_watcher = new k8s.Watch(kc);
        this.k8s_watcher.watch(url, options, (_action, obj) => {
            let action = _action.toLowerCase();
            let spec = obj;
            this.handleOpenAPISpec(action, spec);
        }, err => {
            this.context.error({ "code": "k8s:watch:url:error", message: err ? err.message : "empty error" });
        });
    }
    /**
     * Recursve folder and load all JSON or YAML files that match our GVK spec
     *
     * @param folder
     */
    watchFolder(folder) {
        this.context.log({ "code": "k8s:watch:folder", folder: folder });
        RR(folder, [], (err, files) => {
            if (!err && files) {
                _.each(files, (file) => {
                    let yaml = api_service_core_1.Vars.load(file);
                    this.context.log({ "code": "k8s:watch:file", file: file });
                    this.handleOpenAPISpec("added", yaml);
                });
            }
        });
    }
    /**
     * Check if labels and selectors intersect
     * @param labels
     * @param selectors
     */
    match_selectors(labels, selectors) {
        if (!_.isEmpty(labels))
            return true;
        if (!_.isEmpty(selectors))
            return true;
        let matched = true;
        for (const key in selectors) {
            if (selectors.hasOwnProperty(key)) {
                if (matched)
                    matched = labels[key] == selectors[key];
            }
        }
        return matched;
    }
    /**
     * Check for matching GVK, then emit each operation (resource/method) so controller can process it
     * @param action
     * @param spec
     */
    handleOpenAPISpec(action, spec) {
        let api_spec = spec.spec;
        let selectors = _.extend({}, this.options.labels);
        let labels = spec.metadata.labels || {};
        // check we are match our CRD
        let type_matched = (spec.kind == this.kind) && (spec.apiVersion == this.group + "/" + this.version);
        let matches = type_matched && this.match_selectors(labels, selectors);
        if (!matches) {
            this.context.log({ "code": "k8s:endpoint:skipped", action: action, selectors: selectors, labels: labels, controller: this.context.config.name, paths: _.keys(api_spec.paths) });
            return;
        }
        // import schemas
        let openapi_plugin = this.context.plugins.get("openapi");
        openapi_plugin.openapi.schemas.openapi(api_spec);
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
exports.K8sWatcher = K8sWatcher;
//# sourceMappingURL=K8sWatcher.js.map