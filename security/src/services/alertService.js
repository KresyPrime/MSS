import { isBlank, throwError } from "../utils.js";
import { ALERT_TYPES, INCIDENT_CAUSES, determineSeverity } from "./alertRuleEngine.js";

/**
 * Fachlogik für Alerts.
 */
export class AlertService {
    /**
     * @param {import("../repositories/alertRepository.js").AlertRepository} alertRepository Alert-Repository
     * @param {import("../repositories/incidentRepository.js").IncidentRepository} incidentRepository Incident-Repository
     * @param {import("./museumClient.js").MuseumClient} museumClient Museum-Client
     * @param {{publishEvent: Function}} eventPublisher Event-Publisher
     */
    constructor(alertRepository, incidentRepository, museumClient, eventPublisher) {
        this.alertRepository = alertRepository;
        this.incidentRepository = incidentRepository;
        this.museumClient = museumClient;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Gibt alle Alerts zurück.
     * @returns {Promise<object[]>}
     */
    async listAlerts() {
        return this.alertRepository.findAll();
    }

    /**
     * Gibt einen Alert zurück.
     * @param {number} id Alert-ID
     * @returns {Promise<object>}
     */
    async getAlert(id) {
        const alert = await this.alertRepository.findById(id);
        if (!alert) throwError("NotFound", "Alert wurde nicht gefunden.", 404);
        return alert;
    }

    /**
     * Gibt alle Incidents zu einem Alert zurück.
     * @param {number} id Alert-ID
     * @returns {Promise<object[]>}
     */
    async listIncidentsByAlert(id) {
        const alert = await this.alertRepository.findById(id);
        if (!alert) throwError("NotFound", "Alert wurde nicht gefunden.", 404);
        return this.incidentRepository.findByAlertId(id);
    }

    /**
     * Legt einen Alert an und erzeugt ein erstes Incident.
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async createAlert(data) {
        const alertData = validateAlert(data);
        await this.museumClient.validateReferences(alertData.roomId, alertData.exhibitId);

        const alert = await this.alertRepository.create(alertData);
        const incident = await this.incidentRepository.create({
            alertId: alert.id,
            roomId: alert.roomId,
            exhibitId: alert.exhibitId,
            type: alert.type,
            cause: alert.cause,
            status: "open",
            severity: determineSeverity(alert.type),
            description: alert.message,
        });

        await this.eventPublisher.publishEvent("created", "Alert", alert.id);
        await this.eventPublisher.publishEvent("created", "Incident", incident.id);

        return { alert, incidents: [incident] };
    }
}

/**
 * Validiert Alertdaten.
 * @param {object} data Request-Daten
 * @returns {object}
 */
function validateAlert(data) {
    if (!data || typeof data !== "object") {
        throwError("BadRequest", "Der Request-Body muss ein JSON-Objekt sein.", 400);
    }
    if (!Number.isInteger(data.roomId) || data.roomId < 1) {
        throwError("BadRequest", "roomId muss eine positive Ganzzahl sein.", 400);
    }
    if (data.exhibitId !== undefined && (!Number.isInteger(data.exhibitId) || data.exhibitId < 1)) {
        throwError("BadRequest", "exhibitId muss eine positive Ganzzahl sein.", 400);
    }
    if (!ALERT_TYPES.includes(data.type)) throwError("BadRequest", "type ist ungültig.", 400);
    if (!INCIDENT_CAUSES.includes(data.cause)) throwError("BadRequest", "cause ist ungültig.", 400);
    if (isBlank(data.timestamp) || Number.isNaN(Date.parse(data.timestamp))) {
        throwError("BadRequest", "timestamp muss ein gültiges Datum sein.", 400);
    }
    if (isBlank(data.message)) throwError("BadRequest", "message ist ein Pflichtfeld.", 400);

    return {
        roomId: data.roomId,
        exhibitId: data.exhibitId,
        type: data.type,
        cause: data.cause,
        timestamp: new Date(data.timestamp).toISOString(),
        message: data.message.trim(),
    };
}
