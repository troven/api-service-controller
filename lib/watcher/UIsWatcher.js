"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const GenericK8sWatcher_1 = require("./GenericK8sWatcher");
const CRD = require("../crds/UIs.json");
// import ptr from 'json-ptr'
class UIsWatcher extends GenericK8sWatcher_1.default {
    constructor() {
        super(...arguments);
        this.uis = {};
    }
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
    getMiddleware() {
        return new UIMiddleware(this);
    }
    handleResource(action, spec) {
        this.context.log({ "code": "k8s:uis:found", action: action, controller: this.context.config.name, name: spec.metadata.name });
        this.uis[spec.metadata.name] = spec.spec;
    }
}
exports.UIsWatcher = UIsWatcher;
class UIMiddleware {
    constructor(watcher) {
        this.watcher = watcher;
        this.name = "ui.config";
        this.title = "UI Config";
        this.defaults = {};
    }
    resolve(top, ui) {
        _.each(ui, (value, key) => {
            // console.log("ui.spec: %o", key);
            if (key === "$ref") {
                const deref = this.watcher.uis[value];
                if (deref) {
                    // console.log("deref[]: %s -> %o", value, deref);
                    ui = this.resolve(top, deref);
                    // delete top[value]
                    // delete ui[key]
                }
                else {
                    ui[key] = value;
                }
            }
            else if (_.isArray(value)) {
                ui[key] = this.resolve(top, value);
            }
            else if (_.isObject(value)) {
                ui[key] = this.resolve(top, value);
            }
            else {
                ui[key] = value;
            }
        });
        return ui;
    }
    fn(_op, _options) {
        return (_req, res) => {
            let ui = _.cloneDeep(this.watcher.uis);
            let ui_config = _.cloneDeep(this.watcher.options.config);
            if (ui_config.routes) {
                ui_config.routes = this.resolve(ui, ui_config.routes);
                // console.log("ui.routes[]: %o", ui_config.routes);
            }
            else {
                let ui_routes = this.resolve(ui, ui);
                ui_config.routes = [];
                // console.log("ui.routes: %o", ui_routes);
                _.each(ui_routes, (r) => {
                    if (r)
                        ui_config.routes.push(r);
                });
            }
            res.json(ui_config);
        };
    }
}
//# sourceMappingURL=UIsWatcher.js.map