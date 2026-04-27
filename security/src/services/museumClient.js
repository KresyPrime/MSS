// KI-Hinweis: Prompt zur Integrations-Doku; Kommentar ergänzt, der fehlertolerante Museum-Service-Prüfung beschreibt.
import { throwError } from "../utils.js";

/** fehlertoleranter REST-zugriff auf den museum-service. */
export class MuseumClient {
    /** erstellt den zugriff. */
    constructor(baseUrl) {
        this.baseUrl = baseUrl?.replace(/\/$/, "");
    }

    /** prüft raum und optionales exponat im museum-service. */
    async validateReferences(roomId, exhibitId) {
        const room = await this.getResource(`/rooms/${roomId}`);
        if (room.status === "not-found") {
            throwError("NotFound", "Der referenzierte Raum existiert nicht.", 404);
        }
        if (room.status === "unavailable") return;

        if (exhibitId === undefined) return;

        const exhibit = await this.getResource(`/exhibits/${exhibitId}`);
        if (exhibit.status === "not-found") {
            throwError("NotFound", "Das referenzierte Exponat existiert nicht.", 404);
        }
        if (exhibit.status === "unavailable") return;

        if (exhibit.data.roomId !== roomId) {
            throwError("BadRequest", "Das Exponat gehört nicht zum angegebenen Raum.", 400);
        }
    }

    /** ruft eine ressource fehlertolerant ab. */
    async getResource(path) {
        if (!this.baseUrl) {
            console.warn("MUSEUM_SERVICE_URL ist nicht gesetzt. Referenzen werden nicht remote geprüft.");
            return { status: "unavailable" };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);

        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                method: "GET",
                signal: controller.signal,
            });

            if (response.status === 404) return { status: "not-found" };
            if (!response.ok) return { status: "unavailable" };

            return {
                status: "ok",
                data: await response.json(),
            };
        } catch (error) {
            console.error("Museum-Service nicht erreichbar:", error.message);
            return { status: "unavailable" };
        } finally {
            clearTimeout(timeout);
        }
    }
}
