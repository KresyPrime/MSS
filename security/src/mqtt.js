import mqtt from "mqtt";

let mqttClient;
let topicPrefix = "mss/events";

/** verbindet sich optional mit dem MQTT-broker und abonniert museum-ereignisse. */
export async function connectMqtt(config, eventHandler) {
    topicPrefix = config.topicPrefix || topicPrefix;

    if (!config.broker) {
        console.warn("MQTT_BROKER ist nicht gesetzt. Events werden nur lokal geloggt.");
        return;
    }

    try {
        mqttClient = await mqtt.connectAsync(config.broker, {
            username: config.username,
            password: config.password,
        });
        await mqttClient.subscribeAsync(`${topicPrefix}/Room`);
        await mqttClient.subscribeAsync(`${topicPrefix}/Exhibit`);
        mqttClient.on("message", async (topic, payload) => {
            try {
                await eventHandler.handleEvent(JSON.parse(payload.toString()));
            } catch (error) {
                console.error("MQTT-Event konnte nicht verarbeitet werden:", error.message);
            }
        });
        console.log(`MQTT verbunden: ${config.broker}`);
    } catch (error) {
        console.error("MQTT-Verbindung fehlgeschlagen:", error.message);
    }
}

/** sendet ein änderungsereignis fehlertolerant an den MQTT-broker. */
export async function publishEvent(event, entity, id) {
    const payload = JSON.stringify({ event, entity, id });
    console.log(`Event ${payload}`);

    if (!mqttClient) return;

    try {
        await mqttClient.publishAsync(`${topicPrefix}/${entity}`, payload);
    } catch (error) {
        console.error("MQTT-Event konnte nicht gesendet werden:", error.message);
    }
}

/** schließt die MQTT-verbindung. */
export function closeMqtt() {
    mqttClient?.end();
}
