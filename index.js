const { emitter, emitted } = require("../../system/component/class.events.js");
const { deserialize } = require("../../system/component/class.labels.js");
const { Notification } = require("../../system/notifications");


module.exports = (info, logger, init) => {
    return init([
        "endpoints"
    ], (scope, [
        C_ENDPOINTS
    ]) => {


        // holds wanted states & parameter for notification
        // TODO: How to clean/remove state when endpoint is deleted?
        let wanted = new Map();


        // handle events on component endpoints
        // check if wanted states matches emitted changes
        emitter.on(emitted, ({ args, event, component }) => {
            if (event === "state" && args[0].type === "number" && component === "endpoints") {
                wanted.forEach((params, state) => {

                    // copied from scenes/trigger-types.js
                    if (params.state === args[0]._id) {

                        logger.verbose(`Change detected for state "${state.name}"`);

                        let match = false;
                        let a = state.value;
                        let b = params.threshold;

                        // a = state value
                        // b = threshold
                        switch (params.operator) {
                            case "<":
                                match = a < b;
                                break;
                            case ">":
                                match = a > b;
                                break;
                            case "<=":
                                match = a <= b;
                                break;
                            case ">=":
                                match = a >= b;
                                break;
                            case "==":
                                match = a == b;
                                break;
                            default:
                                match = false;
                        }

                        // trigger & lock 
                        if (match && !params.locked) {

                            params.locked = true;

                            logger.info(`Send notification for state`, state, params);

                            let notification = new Notification({
                                title: "State reached threshold value",
                                message: `State "${state.name}" = ${state.value}. Threshold value (${params.operator}${params.threshold}) reached`,
                                type: "info"
                            });

                            notification.publish();

                        }

                        // reset lock based on operator
                        if (params.operator === "<" || params.operator === "<=") {
                            if (a > b && params.locked) {

                                params.locked = false;
                                logger.debug(`Notfication lock reseted for state "${state.name}"`);

                            }
                        } else if (params.operator === ">" || params.operator === ">=") {
                            if (a < b && params.locked) {

                                params.locked = false;
                                logger.debug(`Notfication lock reseted for state "${state.name}"`);

                            }
                        } else if (params.operator === "==") {
                            if (a !== b && params.locked) {

                                params.locked = false;
                                logger.debug(`Notfication lock reseted for state "${state.name}"`);

                            }
                        }

                    }

                });
            }
        });


        // warum so?
        // scene definieren, die als trigger endpoint state hat
        // und dann dort makro "notification" auausführen
        // muss aber erst "dynmic makros" implementiert werden
        // https://github.com/OpenHausIO/backend/issues/519
        // oder warum nicht both?!
        C_ENDPOINTS.found({
            labels: [
                "notifications.enabled=true",
                "notifications.target[]=*"
            ]
        }, (endpoint) => {

            let label = endpoint.labels.map((label) => {
                return label.toString();
            });

            let { notifications } = deserialize(label);

            logger.debug(`Notification object on endpoint "${endpoint.name}"`, notifications);

            if (notifications?.target?.length <= 0) {
                logger.warn(`No notifications targets found for endpoint "${endpoint.name}"`);
                return;
            }

            notifications.target.map((target) => {

                // parse json string from label
                // target = {"state": "...", threashold: 25, operator: ">="}
                return JSON.parse(target);

            }).forEach((target) => {

                let state = endpoint.states.find(({ _id }) => {
                    return _id === target.state;
                });

                if (!state) {
                    logger.warn(`Endpoint state "${target.state}" not found in endpoint "${endpoint.name}"`);
                    return;
                }

                // patch threshold lock
                target.locked = false;

                wanted.set(state, target);

            });

        });


    });
};