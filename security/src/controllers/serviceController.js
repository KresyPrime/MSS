/** registriert serviceinfos und healthcheck. */
export function registerServiceController(app) {
    app.get("/", getIndex);
    app.get("/health", getHealth);
}

/** liefert den API-einstiegspunkt. */
function getIndex(req, res) {
    res.status(200).json({
        service: "security",
        _links: {
            self: { href: "/", method: "GET" },
            health: { href: "/health", method: "GET" },
            alerts: { href: "/alerts", method: "GET" },
            createAlert: { href: "/alerts", method: "POST" },
            incidents: { href: "/incidents", method: "GET" },
            createIncident: { href: "/incidents", method: "POST" },
        },
    });
}

/** liefert den servicestatus. */
function getHealth(req, res) {
    res.status(200).json({
        service: "security",
        status: "ok",
    });
}
