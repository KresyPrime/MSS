import { parseId } from "../utils.js";
import { asyncHandler } from "../middleware.js";

/**
 * Registriert Raum-Endpunkte.
 * @param {import("express").Express} app Express-App
 * @param {import("../services/roomService.js").RoomService} roomService Raum-Service
 * @param {import("../services/exhibitService.js").ExhibitService} exhibitService Exponat-Service
 */
export function registerRoomController(app, roomService, exhibitService) {
    app.get("/rooms", asyncHandler(async (req, res) => {
        res.status(200).json(await roomService.listRooms());
    }));

    app.post("/rooms", asyncHandler(async (req, res) => {
        res.status(201).json(await roomService.createRoom(req.body));
    }));

    app.get("/rooms/:id", asyncHandler(async (req, res) => {
        res.status(200).json(await roomService.getRoom(parseId(req.params.id)));
    }));

    app.put("/rooms/:id", asyncHandler(async (req, res) => {
        res.status(200).json(await roomService.replaceRoom(parseId(req.params.id), req.body));
    }));

    app.delete("/rooms/:id", asyncHandler(async (req, res) => {
        await roomService.deleteRoom(parseId(req.params.id));
        res.status(200).json({ message: "Deleted successfully" });
    }));

    app.get("/rooms/:id/exhibits", asyncHandler(async (req, res) => {
        res.status(200).json(await exhibitService.listExhibitsByRoom(parseId(req.params.id)));
    }));
}
