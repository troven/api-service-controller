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

import {IChassisPlugin, IChassisContext, Paths, IChassisPluginOptions } from "api-service-main";
import * as k8s from '@kubernetes/client-node';
import { WardenWatcher } from "./WardenWatcher";
/**
 * WardenPlugin
 * ---------
 * Used when a method is not found
 *
 * @type {{name: string, title: string, fn: module.exports.fn}}
 */
export class WardenPlugin implements IChassisPlugin {

    name: string = "warden";
    title: string = "Warden Plugin";
    group: string = "k8s.troven.io"
    version: string = "v1alpha1"
    type: string = "Warden"

    routes: any = {};
    watcher: WardenWatcher;

    install(context: IChassisContext, _options: IChassisPluginOptions) {
        false && context;
        let options:any = _options;

        let paths: Paths = new Paths(context);

        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();

        let namespace = options.namespace || "default";
        let watch_url = "/apis/"+this.group+"/"+this.version+"/namespaces/"+namespace+"/wardens/";

        context.log({"code": "code", "message": "watching", namespace: namespace, watch: watch_url});

        this.watcher = new WardenWatcher(kc, watch_url, options);
        this.watcher.on("warden:added", function(iwr: IWardenResource) {
            paths.addEndpoint({}, iwr.method, iwr.path,);
            console.log("[ADD] %j", iwr);
        });

    }

}
