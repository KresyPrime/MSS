import dotenv from "dotenv";
import express from "express";

import { initializeDatabase } from "./database.js";
import { closeMqtt, connectMqtt, publishEvent } from "./mqtt.js";
import { allowCors, logRequests, handleErrors } from "./middleware.js";
import { ExhibitRepository } from "./repositories/exhibitRepository.js";
import { RoomRepository } from "./repositories/roomRepository.js";
import { ExhibitService } from "./services/exhibitService.js";
import { RoomService } from "./services/roomService.js";
import { registerExhibitController } from "./controllers/exhibitController.js";
import { registerRoomController } from "./controllers/roomController.js";
import { registerServiceController } from "./controllers/serviceController.js";

dotenv.config();

const app = express();
const host = process.env.LISTEN_HOST || "127.0.0.1";
const port = Number(process.env.LISTEN_PORT || 9001);
const databaseFile = process.env.DATABASE_FILE || "museum.sqlite";

const db = await initializeDatabase(databaseFile);
await connectMqtt({
    broker: process.env.MQTT_BROKER,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    topicPrefix: process.env.MQTT_TOPIC_PREFIX,
});

const roomRepository = new RoomRepository(db);
const exhibitRepository = new ExhibitRepository(db);
const eventPublisher = { publishEvent };
const roomService = new RoomService(roomRepository, eventPublisher);
const exhibitService = new ExhibitService(exhibitRepository, roomService, eventPublisher);

app.use(allowCors);
app.use(express.json());
app.use(logRequests);

registerServiceController(app);
registerRoomController(app, roomService, exhibitService);
registerExhibitController(app, exhibitService);

app.use(handleErrors);

const server = app.listen(port, host, () => {
    console.log(`Museum-Service läuft auf http://${host}:${port}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * Beendet externe Ressourcen sauber.
 */
async function shutdown() {
    server.close();
    closeMqtt();
    await db.close();
    process.exit(0);
}
