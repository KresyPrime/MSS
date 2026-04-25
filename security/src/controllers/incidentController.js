import { parseId } from "../utils.js";

/**
 * Registriert Incident-Endpunkte.
 * @param {import("express").Express} app Express-App
 * @param {import("../services/incidentService.js").IncidentService} incidentService Incident-Service
 */
export function registerIncidentController(app, incidentService) {
    app.get("/incidents", asyncHandler(async (req, res) => {
        res.status(200).json(await incidentService.listIncidents());
    }));

    app.post("/incidents", asyncHandler(async (req, res) => {
        res.status(201).json(await incidentService.createIncident(req.body));
    }));

    app.get("/incidents/:id", asyncHandler(async (req, res) => {
        res.status(200).json(await incidentService.getIncident(parseId(req.params.id)));
    }));

    app.put("/incidents/:id", asyncHandler(async (req, res) => {
        res.status(200).json(await incidentService.updateIncident(parseId(req.params.id), req.body));
    }));

    app.delete("/incidents/:id", asyncHandler(async (req, res) => {
        await incidentService.deleteIncident(parseId(req.params.id));
        res.status(200).json({ message: "Deleted successfully" });
    }));
}

/**
 * Leitet Fehler aus asynchronen Handlern an Express weiter.
 * @param {Function} handler HTTP-Handler
 * @returns {Function}
 */
function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
