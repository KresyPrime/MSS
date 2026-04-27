// KI-Hinweis: Prompt zur Express-Doku; Kommentar ergänzt, der CORS, Logging und Fehlerausgabe kurz kennzeichnet.
/** erlaubt zugriffe aus swagger und anderen werkzeugen. */
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

/** protokolliert eingehende HTTP-anfragen. */
export function logRequests(req, res, next) {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
}

/** leitet fehler aus asynchronen handlern an express weiter. */
export function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/** gibt fehler einheitlich als JSON zurück. */
export function handleErrors(err, req, res, next) {
    console.error(err);

    const status = err.httpStatus || 500;

    res.status(status).json({
        status,
        error: err.name || "InternalServerError",
        message: err.message || "Unbekannter Fehler",
    });
}
