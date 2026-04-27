// KI-Hinweis: Prompt zur Startstruktur; Kommentar ergänzt, der Security-Setup, MQTT und REST-Routen zusammenfasst.
import dotenv from "dotenv";
import express from "express";

import { initializeDatabase } from "./database.js";
import { closeMqtt, connectMqtt, publishEvent } from "./mqtt.js";
import { allowCors, logRequests, handleErrors } from "./middleware.js";
import { AlertRepository } from "./repositories/alertRepository.js";
import { IncidentRepository } from "./repositories/incidentRepository.js";
import { registerAlertController } from "./controllers/alertController.js";
import { registerIncidentController } from "./controllers/incidentController.js";
import { registerServiceController } from "./controllers/serviceController.js";
import { AlertService } from "./services/alertService.js";
import { IncidentService } from "./services/incidentService.js";
import { MuseumClient } from "./services/museumClient.js";
import { MuseumEventService } from "./services/museumEventService.js";

dotenv.config();

const app = express();
const host = process.env.LISTEN_HOST || "127.0.0.1";
const port = Number(process.env.LISTEN_PORT || 9002);
const databaseFile = process.env.DATABASE_FILE || "security.sqlite";

const db = await initializeDatabase(databaseFile);
const alertRepository = new AlertRepository(db);
const incidentRepository = new IncidentRepository(db);
const museumClient = new MuseumClient(process.env.MUSEUM_SERVICE_URL);
const eventPublisher = { publishEvent };
const museumEventService = new MuseumEventService(alertRepository, incidentRepository);
const alertService = new AlertService(alertRepository, incidentRepository, museumClient, eventPublisher);
const incidentService = new IncidentService(incidentRepository, alertRepository, museumClient, eventPublisher);

await connectMqtt({
    broker: process.env.MQTT_BROKER,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    topicPrefix: process.env.MQTT_TOPIC_PREFIX,
}, museumEventService);

app.use(allowCors);
app.use(express.json());
app.use(logRequests);

registerServiceController(app);
registerAlertController(app, alertService);
registerIncidentController(app, incidentService);

app.use(handleErrors);

const server = app.listen(port, host, () => {
    console.log(`Security-Service läuft auf http://${host}:${port}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/** beendet externe ressourcen sauber. */
async function shutdown() {
    server.close();
    closeMqtt();
    await db.close();
    process.exit(0);
}
