import { parseId } from "../utils.js";
import { asyncHandler } from "../middleware.js";

/**
 * Registriert Exponat-Endpunkte.
 * @param {import("express").Express} app Express-App
 * @param {import("../services/exhibitService.js").ExhibitService} exhibitService Exponat-Service
 */
export function registerExhibitController(app, exhibitService) {
    app.get("/exhibits", asyncHandler(async (req, res) => {
        res.status(200).json(await exhibitService.listExhibits());
    }));

    app.post("/exhibits", asyncHandler(async (req, res) => {
        res.status(201).json(await exhibitService.createExhibit(req.body));
    }));

    app.get("/exhibits/:id", asyncHandler(async (req, res) => {
        res.status(200).json(await exhibitService.getExhibit(parseId(req.params.id)));
    }));

    app.put("/exhibits/:id", asyncHandler(async (req, res) => {
        res.status(200).json(await exhibitService.replaceExhibit(parseId(req.params.id), req.body));
    }));

    app.delete("/exhibits/:id", asyncHandler(async (req, res) => {
        await exhibitService.deleteExhibit(parseId(req.params.id));
        res.status(200).json({ message: "Deleted successfully" });
    }));
}
