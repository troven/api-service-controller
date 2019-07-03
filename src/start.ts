'use strict'
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
import { Chassis } from "api-service-core";
import { default_features  } from "api-service-common";
import { MongoStore  } from "api-service-mongo";
import { ControllerPlugin } from "./controller/ControllerPlugin";
const config = require("config");

// configure a new chassis
let chassis = new Chassis(config, default_features);

// register our custom plugin
chassis.registerPlugin( new ControllerPlugin() );
chassis.registerPlugin( new MongoStore() );

// start the Chassis ...
chassis.start();

// requests are now served - events emitted, logs and audit trails are generated
