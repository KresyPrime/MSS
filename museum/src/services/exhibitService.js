import { isBlank, throwError } from "../utils.js";

/**
 * Fachlogik für Exponate.
 */
export class ExhibitService {
    /**
     * @param {import("../repositories/exhibitRepository.js").ExhibitRepository} exhibitRepository Exponat-Repository
     * @param {import("./roomService.js").RoomService} roomService Raum-Service
     * @param {{publishEvent: Function}} eventPublisher Event-Publisher
     */
    constructor(exhibitRepository, roomService, eventPublisher) {
        this.exhibitRepository = exhibitRepository;
        this.roomService = roomService;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Gibt alle Exponate zurück.
     * @returns {Promise<object[]>}
     */
    async listExhibits() {
        return this.exhibitRepository.findAll();
    }

    /**
     * Gibt alle Exponate eines Raumes zurück.
     * @param {number} roomId Raum-ID
     * @returns {Promise<object[]>}
     */
    async listExhibitsByRoom(roomId) {
        await this.roomService.getRoom(roomId);
        return this.exhibitRepository.findByRoomId(roomId);
    }

    /**
     * Gibt ein Exponat zurück.
     * @param {number} id Exponat-ID
     * @returns {Promise<object>}
     */
    async getExhibit(id) {
        const exhibit = await this.exhibitRepository.findById(id);
        if (!exhibit) throwError("NotFound", "Exponat wurde nicht gefunden.", 404);
        return exhibit;
    }

    /**
     * Legt ein Exponat an.
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async createExhibit(data) {
        const exhibitData = await this.validateExhibit(data);
        const exhibit = await this.exhibitRepository.create(exhibitData);
        await this.eventPublisher.publishEvent("created", "Exhibit", exhibit.id);
        return exhibit;
    }

    /**
     * Ersetzt ein Exponat.
     * @param {number} id Exponat-ID
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async replaceExhibit(id, data) {
        const exhibitData = await this.validateExhibit(data);
        const exhibit = await this.exhibitRepository.replace(id, exhibitData);
        if (!exhibit) throwError("NotFound", "Exponat wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("updated", "Exhibit", exhibit.id);
        return exhibit;
    }

    /**
     * Löscht ein Exponat.
     * @param {number} id Exponat-ID
     * @returns {Promise<void>}
     */
    async deleteExhibit(id) {
        const deleted = await this.exhibitRepository.delete(id);
        if (!deleted) throwError("NotFound", "Exponat wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("deleted", "Exhibit", id);
    }

    /**
     * Validiert Exponatdaten.
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async validateExhibit(data) {
        if (!data || typeof data !== "object") {
            throwError("BadRequest", "Der Request-Body muss ein JSON-Objekt sein.", 400);
        }
        if (isBlank(data.name)) throwError("BadRequest", "name ist ein Pflichtfeld.", 400);
        if (!Number.isInteger(data.roomId) || data.roomId < 1) {
            throwError("BadRequest", "roomId muss eine positive Ganzzahl sein.", 400);
        }
        if (data.artist !== undefined && typeof data.artist !== "string") {
            throwError("BadRequest", "artist muss ein Text sein.", 400);
        }
        if (data.estimatedValue !== undefined && (
            typeof data.estimatedValue !== "number" || data.estimatedValue < 0
        )) {
            throwError("BadRequest", "estimatedValue muss eine positive Zahl sein.", 400);
        }

        await this.roomService.getRoom(data.roomId);

        return {
            name: data.name.trim(),
            artist: data.artist?.trim() || undefined,
            estimatedValue: data.estimatedValue,
            roomId: data.roomId,
        };
    }
}
