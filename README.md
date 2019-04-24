Customizing the Chassis
----------------------

The Chassis loads it's config from ./config/default.yaml

The "openapi@" directive then causes chassis to load ./docs/swagger.yaml

The Chassis when boots an API using a combination of a custom plugin, built-in features and a remote service via the proxy.

Custom IChassisMiddleware
--------------------------

A plugin is very simple. It contain three mandatory fields "name", "title" and "fn".

The "fn" receives the context and options and returns the classic Connect middleware pattern:

```
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
```

Custom Chassis Service
----------------------

To use the LocalExample Plugin, we need to boot up a new micro-service.

The following code loads the custom plugin, configures then starts the Chassis.

```
// Load Chassis and the runtime configuration
import { Chassis, default_features  } from "api-service-main";
const config = require("config");

// Load custom middleware / Operation
import { LocalExample } from "./local-example";

// configure a new chassis with default features
let chassis = new Chassis(config, default_features);

// register our custom plugin
chassis.registerFn( new LocalExample() );

// start the service ...
chassis.start();
```


