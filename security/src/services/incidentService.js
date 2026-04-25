import { isBlank, throwError } from "../utils.js";
import { ALERT_TYPES, INCIDENT_CAUSES } from "./alertRuleEngine.js";

const INCIDENT_STATUSES = ["open", "investigating", "confirmed", "false_alarm", "resolved"];
const INCIDENT_SEVERITIES = ["low", "medium", "high", "critical"];

/**
 * Fachlogik für Incidents.
 */
export class IncidentService {
    /**
     * @param {import("../repositories/incidentRepository.js").IncidentRepository} incidentRepository Incident-Repository
     * @param {import("../repositories/alertRepository.js").AlertRepository} alertRepository Alert-Repository
     * @param {import("./museumClient.js").MuseumClient} museumClient Museum-Client
     * @param {{publishEvent: Function}} eventPublisher Event-Publisher
     */
    constructor(incidentRepository, alertRepository, museumClient, eventPublisher) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.museumClient = museumClient;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Gibt alle Incidents zurück.
     * @returns {Promise<object[]>}
     */
    async listIncidents() {
        return this.incidentRepository.findAll();
    }

    /**
     * Gibt ein Incident zurück.
     * @param {number} id Incident-ID
     * @returns {Promise<object>}
     */
    async getIncident(id) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) throwError("NotFound", "Incident wurde nicht gefunden.", 404);
        return incident;
    }

    /**
     * Legt ein manuelles Incident an.
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async createIncident(data) {
        const incidentData = await this.validateIncident(data, true);
        const incident = await this.incidentRepository.create(incidentData);
        await this.eventPublisher.publishEvent("created", "Incident", incident.id);
        return incident;
    }

    /**
     * Aktualisiert ein Incident.
     * @param {number} id Incident-ID
     * @param {object} data Request-Daten
     * @returns {Promise<object>}
     */
    async updateIncident(id, data) {
        const update = validateIncidentUpdate(data);
        const incident = await this.incidentRepository.update(id, update);
        if (!incident) throwError("NotFound", "Incident wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("updated", "Incident", incident.id);
        return incident;
    }

    /**
     * Löscht ein Incident.
     * @param {number} id Incident-ID
     * @returns {Promise<void>}
     */
    async deleteIncident(id) {
        const deleted = await this.incidentRepository.delete(id);
        if (!deleted) throwError("NotFound", "Incident wurde nicht gefunden.", 404);
        await this.eventPublisher.publishEvent("deleted", "Incident", id);
    }

    /**
     * Validiert manuelle Incident-Daten.
     * @param {object} data Request-Daten
     * @param {boolean} checkRemoteReferences Remote-Referenzen prüfen
     * @returns {Promise<object>}
     */
    async validateIncident(data, checkRemoteReferences) {
        if (!data || typeof data !== "object") {
            throwError("BadRequest", "Der Request-Body muss ein JSON-Objekt sein.", 400);
        }
        if (data.alertId !== undefined) {
            if (!Number.isInteger(data.alertId) || data.alertId < 1) {
                throwError("BadRequest", "alertId muss eine positive Ganzzahl sein.", 400);
            }
            if (!await this.alertRepository.findById(data.alertId)) {
                throwError("NotFound", "Der referenzierte Alert existiert nicht.", 404);
            }
        }
        if (!Number.isInteger(data.roomId) || data.roomId < 1) {
            throwError("BadRequest", "roomId muss eine positive Ganzzahl sein.", 400);
        }
        if (data.exhibitId !== undefined && (!Number.isInteger(data.exhibitId) || data.exhibitId < 1)) {
            throwError("BadRequest", "exhibitId muss eine positive Ganzzahl sein.", 400);
        }
        if (!ALERT_TYPES.includes(data.type)) throwError("BadRequest", "type ist ungültig.", 400);
        if (!INCIDENT_CAUSES.includes(data.cause)) throwError("BadRequest", "cause ist ungültig.", 400);
        if (!INCIDENT_STATUSES.includes(data.status)) throwError("BadRequest", "status ist ungültig.", 400);
        if (!INCIDENT_SEVERITIES.includes(data.severity)) throwError("BadRequest", "severity ist ungültig.", 400);
        if (isBlank(data.description)) throwError("BadRequest", "description ist ein Pflichtfeld.", 400);

        const resolvedAt = validateResolvedAt(data.status, data.resolvedAt);
        if (checkRemoteReferences) {
            await this.museumClient.validateReferences(data.roomId, data.exhibitId);
        }

        return {
            alertId: data.alertId,
            roomId: data.roomId,
            exhibitId: data.exhibitId,
            type: data.type,
            cause: data.cause,
            status: data.status,
            severity: data.severity,
            description: data.description.trim(),
            resolvedAt,
        };
    }
}

/**
 * Validiert Incident-Updates.
 * @param {object} data Request-Daten
 * @returns {object}
 */
function validateIncidentUpdate(data) {
    if (!data || typeof data !== "object") {
        throwError("BadRequest", "Der Request-Body muss ein JSON-Objekt sein.", 400);
    }
    if (!INCIDENT_STATUSES.includes(data.status)) throwError("BadRequest", "status ist ungültig.", 400);
    if (isBlank(data.description)) throwError("BadRequest", "description ist ein Pflichtfeld.", 400);

    return {
        status: data.status,
        description: data.description.trim(),
        resolvedAt: validateResolvedAt(data.status, data.resolvedAt),
    };
}

/**
 * Validiert die resolvedAt-Statusregel.
 * @param {string} status Incident-Status
 * @param {string|undefined} resolvedAt Abschlusszeitpunkt
 * @returns {string|undefined}
 */
function validateResolvedAt(status, resolvedAt) {
    if (status === "resolved") {
        if (isBlank(resolvedAt) || Number.isNaN(Date.parse(resolvedAt))) {
            throwError("BadRequest", "resolvedAt ist bei resolved erforderlich.", 400);
        }
        return new Date(resolvedAt).toISOString();
    }

    if (resolvedAt !== undefined) {
        throwError("BadRequest", "resolvedAt darf nur bei status resolved gesetzt sein.", 400);
    }

    return undefined;
}
