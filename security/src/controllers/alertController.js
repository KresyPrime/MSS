import { parseId } from "../utils.js";
import { asyncHandler } from "../middleware.js";

/** registriert die alert-endpunkte. */
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

    app.get("/alerts/:id/incidents", asyncHandler(async (req, res) => {
        res.status(200).json(await alertService.listIncidentsByAlert(parseId(req.params.id)));
    }));
}
