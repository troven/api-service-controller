'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
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
// Load Chassis and the runtime configuration
const api_service_core_1 = require("api-service-core");
const api_service_common_1 = require("api-service-common");
const api_service_mongo_1 = require("api-service-mongo");
const Controller_1 = require("./plugin/Controller");
const config = require("config");
// configure a new chassis
let chassis = new api_service_core_1.Chassis(config, api_service_common_1.default_features);
// register our custom plugin
chassis.registerPlugin(new Controller_1.ControllerPlugin());
chassis.registerPlugin(new api_service_mongo_1.MongoStore());
// start the Chassis ...
chassis.start();
//# sourceMappingURL=start.js.map