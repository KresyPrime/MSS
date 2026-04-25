/**
 * Verarbeitet relevante Events aus anderen Microservices.
 */
export class MuseumEventService {
    /**
     * @param {import("../repositories/alertRepository.js").AlertRepository} alertRepository Alert-Repository
     * @param {import("../repositories/incidentRepository.js").IncidentRepository} incidentRepository Incident-Repository
     */
    constructor(alertRepository, incidentRepository) {
        this.alertRepository = alertRepository;
        this.incidentRepository = incidentRepository;
    }

    /**
     * Verarbeitet ein eingehendes MQTT-Event.
     * @param {{event: string, entity: string, id: number}} payload Eventdaten
     */
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
