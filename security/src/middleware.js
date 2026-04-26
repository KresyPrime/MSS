/**
 * Erlaubt Browser-Zugriffe von Swagger Editor und anderen Entwicklungswerkzeugen.
 * @param {import("express").Request} req HTTP-Request
 * @param {import("express").Response} res HTTP-Response
 * @param {import("express").NextFunction} next Nächste Middleware
 */
export function allowCors(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }

    next();
}

/**
 * Protokolliert eingehende HTTP-Anfragen.
 * @param {import("express").Request} req HTTP-Request
 * @param {import("express").Response} res HTTP-Response
 * @param {import("express").NextFunction} next Nächste Middleware
 */
export function logRequests(req, res, next) {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
}

/**
 * Einheitliche Fehlerbehandlung.
 * @param {Error} err Fehlerobjekt
 * @param {import("express").Request} req HTTP-Request
 * @param {import("express").Response} res HTTP-Response
 * @param {import("express").NextFunction} next Nächste Middleware
 */
export function handleErrors(err, req, res, next) {
    console.error(err);

    const status = err.httpStatus || 500;

    res.status(status).json({
        status,
        error: err.name || "InternalServerError",
        message: err.message || "Unbekannter Fehler",
    });
}
