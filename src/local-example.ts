/*************************************************************************
 *
 * APIGEEKS CONFIDENTIAL
 * __________________
 *
 *  (c) 2017-2019 API Geeks Pty Ltd
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of API Geeks Pty Ltd and its licensors,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to API Geeks Pty Ltd
 * and its suppliers and may be covered by International and Regional Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from API Geeks Pty Ltd.
 */

import { IOperation, IChassisContext, IChassisMiddleware } from "api-service-main";
import assert from "assert";
export class LocalExample implements IChassisMiddleware {

    name = "local-example";
    title = "Local Example";

    fn(operation: IOperation, options: any) {

        let context: IChassisContext = operation.context;
        return function (req, res, next) {
            assert (req && res && next, "invalid middleware");

            res.status(200);
            res.send({ example: true, service: context.config.name, message: options.message, now: Date.now() });
        };
    }
};
