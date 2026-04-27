// KI-Hinweis: Prompt zur Service-Dokumentation; Kommentar ergänzt, der Exponatlogik, Validierung und Raumbezug abgrenzt.
import { isBlank, throwError } from "../utils.js";

/** fachlogik für exponate. */
export class ExhibitService {
    /** erstellt den service. */
    constructor(exhibitRepository, roomService, eventPublisher) {
        this.exhibitRepository = exhibitRepository;
        this.roomService = roomService;
        this.eventPublisher = eventPublisher;
    }

    /** gibt alle exponate zurück. */
    async listExhibits() {
        return this.exhibitRepository.findAll();
    }

    /** gibt alle exponate eines raums zurück. */
    async listExhibitsByRoom(roomId) {
        await this.roomService.getRoom(roomId);
        return this.exhibitRepository.findByRoomId(roomId);
    }

    /** gibt ein exponat zurück. */
    async getExhibit(id) {
        const exhibit = await this.exhibitRepository.findById(id);
        if (!exhibit) throwError("NotFound", "Exponat wurde nicht gefunden.", 404);
        return exhibit;
    }

    /** legt ein exponat an. */
    async createExhibit(data) {
        const exhibitData = await this.validateExhibit(data);
        const exhibit = await this.exhibitRepository.create(exhibitData);
        await this.eventPublisher.publishEvent("created", "Exhibit", exhibit.id);
        return exhibit;
    }

    /** ersetzt ein exponat. */
    async replaceExhibit(id, data) {
        const exhibitData = await this.validateExhibit(data);
        const exhibit = await this.exhibitRepository.replace(id, exhibitData);
        if (!exhibit) throwError("NotFound", "Exponat wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("updated", "Exhibit", exhibit.id);
        return exhibit;
    }

    /** löscht ein exponat. */
    async deleteExhibit(id) {
        const deleted = await this.exhibitRepository.delete(id);
        if (!deleted) throwError("NotFound", "Exponat wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("deleted", "Exhibit", id);
    }

    /** validiert exponatdaten. */
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
