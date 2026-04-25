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

    res.status(err.httpStatus || 500).json({
        error: err.name || "InternalServerError",
        message: err.message || "Unbekannter Fehler",
    });
}