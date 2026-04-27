// KI-Hinweis: Prompt zur Service-Dokumentation; Kommentar ergänzt, der Raumlogik, Validierung und Events abgrenzt.
import { isBlank, throwError } from "../utils.js";

/** fachlogik für räume. */
export class RoomService {
    /** erstellt den service. */
    constructor(roomRepository, eventPublisher) {
        this.roomRepository = roomRepository;
        this.eventPublisher = eventPublisher;
    }

    /** gibt alle räume zurück. */
    async listRooms() {
        return this.roomRepository.findAll();
    }

    /** gibt einen raum zurück. */
    async getRoom(id) {
        const room = await this.roomRepository.findById(id);
        if (!room) throwError("NotFound", "Raum wurde nicht gefunden.", 404);
        return room;
    }

    /** legt einen raum an. */
    async createRoom(data) {
        const room = await this.roomRepository.create(validateRoom(data));
        await this.eventPublisher.publishEvent("created", "Room", room.id);
        return room;
    }

    /** ersetzt einen raum. */
    async replaceRoom(id, data) {
        const room = await this.roomRepository.replace(id, validateRoom(data));
        if (!room) throwError("NotFound", "Raum wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("updated", "Room", room.id);
        return room;
    }

    /** löscht einen raum. */
    async deleteRoom(id) {
        const deleted = await this.roomRepository.delete(id);
        if (!deleted) throwError("NotFound", "Raum wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("deleted", "Room", id);
    }
}

/** validiert raumdaten. */
function validateRoom(data) {
    if (!data || typeof data !== "object") {
        throwError("BadRequest", "Der Request-Body muss ein JSON-Objekt sein.", 400);
    }
    if (isBlank(data.name)) throwError("BadRequest", "name ist ein Pflichtfeld.", 400);
    if (!Number.isInteger(data.floor)) throwError("BadRequest", "floor muss eine Ganzzahl sein.", 400);
    if (data.theme !== undefined && typeof data.theme !== "string") {
        throwError("BadRequest", "theme muss ein Text sein.", 400);
    }
    if (data.isMonitored !== undefined && typeof data.isMonitored !== "boolean") {
        throwError("BadRequest", "isMonitored muss ein Boolean sein.", 400);
    }

    return {
        name: data.name.trim(),
        floor: data.floor,
        theme: data.theme?.trim() || undefined,
        isMonitored: data.isMonitored ?? false,
    };
}
