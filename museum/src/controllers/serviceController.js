/**
 * Registriert Service-Metadaten und Healthcheck.
 * @param {import("express").Express} app Express-App
 */
export function registerServiceController(app) {
    app.get("/", getIndex);
    app.get("/health", getHealth);
}

/**
 * Liefert den API-Einstiegspunkt.
 * @param {import("express").Request} req HTTP-Request
 * @param {import("express").Response} res HTTP-Response
 */
function getIndex(req, res) {
    res.status(200).json({
        service: "museum",
        _links: {
            self: { href: "/", method: "GET" },
            health: { href: "/health", method: "GET" },
            rooms: { href: "/rooms", method: "GET" },
            createRoom: { href: "/rooms", method: "POST" },
            exhibits: { href: "/exhibits", method: "GET" },
            createExhibit: { href: "/exhibits", method: "POST" },
        },
    });
}

/**
 * Liefert den Servicestatus.
 * @param {import("express").Request} req HTTP-Request
 * @param {import("express").Response} res HTTP-Response
 */
function getHealth(req, res) {
    res.status(200).json({
        service: "museum",
        status: "ok",
    });
}
