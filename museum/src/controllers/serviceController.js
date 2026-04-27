/** registriert serviceinfos und healthcheck. */
export function registerServiceController(app) {
    app.get("/", getIndex);
    app.get("/health", getHealth);
}

/** liefert den API-einstiegspunkt. */
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

/** liefert den servicestatus. */
function getHealth(req, res) {
    res.status(200).json({
        service: "museum",
        status: "ok",
    });
}
