// KI-Hinweis: Prompt zur Hilfsfunktionen-Doku; Kommentar ergänzt, der Fehler- und ID-Helfer zusammenfasst.
/** erzeugt einen fehler mit HTTP-statuscode. */
export function createError(name, message, httpStatus) {
    const error = new Error(message);
    error.name = name;
    error.httpStatus = httpStatus;
    return error;
}

/** wirft einen fehler mit HTTP-statuscode. */
export function throwError(name, message, httpStatus = 400) {
    throw createError(name, message, httpStatus);
}

/** prüft, ob ein wert leer ist. */
export function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}

/** wandelt eine pfad-id in eine positive ganzzahl um. */
export function parseId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id < 1) {
        throwError("BadRequest", "Die ID muss eine positive Ganzzahl sein.", 400);
    }

    return id;
}
