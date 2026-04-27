// KI-Hinweis: Prompt zur Event-Doku; Kommentar ergänzt, der Reaktion auf geloeschte Museum-Daten einordnet.
/** verarbeitet relevante museum-ereignisse. */
export class MuseumEventService {
    /** erstellt den service. */
    constructor(alertRepository, incidentRepository) {
        this.alertRepository = alertRepository;
        this.incidentRepository = incidentRepository;
    }

    /** verarbeitet ein eingehendes MQTT-ereignis. */
    async handleEvent(payload) {
        if (payload?.event !== "deleted") return;

        if (payload.entity === "Room") {
            await this.incidentRepository.deleteByRoomId(payload.id);
            await this.alertRepository.deleteByRoomId(payload.id);
        }

        if (payload.entity === "Exhibit") {
            await this.incidentRepository.clearExhibitId(payload.id);
            await this.alertRepository.clearExhibitId(payload.id);
        }
    }
}
