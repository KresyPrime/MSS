import mqtt from "mqtt";

let mqttClient;
let topicPrefix = "mss/events";

/**
 * Stellt optional eine Verbindung zum MQTT-Broker her.
 * @param {{broker?: string, username?: string, password?: string, topicPrefix?: string}} config MQTT-Konfiguration
 */
export async function connectMqtt(config) {
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
        console.log(`MQTT verbunden: ${config.broker}`);
    } catch (error) {
        console.error("MQTT-Verbindung fehlgeschlagen:", error.message);
    }
}

/**
 * Sendet ein Änderungs-Event fehlertolerant an den MQTT-Broker.
 * @param {string} event Ereignisname
 * @param {string} entity Entitätsname
 * @param {number} id Schlüsselwert
 */
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

/**
 * Schließt die MQTT-Verbindung.
 */
export function closeMqtt() {
    mqttClient?.end();
}
