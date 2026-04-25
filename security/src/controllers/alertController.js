import { parseId } from "../utils.js";

/**
 * Registriert Alert-Endpunkte.
 * @param {import("express").Express} app Express-App
 * @param {import("../services/alertService.js").AlertService} alertService Alert-Service
 */
export function registerAlertController(app, alertService) {
    app.get("/alerts", asyncHandler(async (req, res) => {
        res.status(200).json(await alertService.listAlerts());
    }));

    app.post("/alerts", asyncHandler(async (req, res) => {
        res.status(201).json(await alertService.createAlert(req.body));
    }));

    app.get("/alerts/:id", asyncHandler(async (req, res) => {
        res.status(200).json(await alertService.getAlert(parseId(req.params.id)));
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
