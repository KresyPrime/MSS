import { isBlank, throwError } from "../utils.js";

/**
 * Fachlogik für Räume.
 */
export class RoomService {
    /**
     * @param {import("../repositories/roomRepository.js").RoomRepository} roomRepository Raum-Repository
     * @param {{publishEvent: Function}} eventPublisher Event-Publisher
     */
    constructor(roomRepository, eventPublisher) {
        this.roomRepository = roomRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Gibt alle Räume zurück.
     * @returns {Promise<object[]>}
     */
    async listRooms() {
        return this.roomRepository.findAll();
    }

    /**
     * Gibt einen Raum zurück.
     * @param {number} id Raum-ID
     * @returns {Promise<object>}
     */
    async getRoom(id) {
        const room = await this.roomRepository.findById(id);
        if (!room) throwError("NotFound", "Raum wurde nicht gefunden.", 404);
        return room;
    }

    /**
     * Legt einen Raum an.
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async createRoom(data) {
        const room = await this.roomRepository.create(validateRoom(data));
        await this.eventPublisher.publishEvent("created", "Room", room.id);
        return room;
    }

    /**
     * Ersetzt einen Raum.
     * @param {number} id Raum-ID
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async replaceRoom(id, data) {
        const room = await this.roomRepository.replace(id, validateRoom(data));
        if (!room) throwError("NotFound", "Raum wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("updated", "Room", room.id);
        return room;
    }

    /**
     * Löscht einen Raum.
     * @param {number} id Raum-ID
     * @returns {Promise<void>}
     */
    async deleteRoom(id) {
        const deleted = await this.roomRepository.delete(id);
        if (!deleted) throwError("NotFound", "Raum wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("deleted", "Room", id);
    }
}

/**
 * Validiert Raumdaten.
 * @param {object} data Request-Daten
 * @returns {object}
 */
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
