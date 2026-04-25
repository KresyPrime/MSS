/**
 * Erzeugt einen Fehler mit HTTP-Statuscode.
 * @param {string} name Fehlername
 * @param {string} message Fehlermeldung
 * @param {number} httpStatus HTTP-Statuscode
 * @returns {Error}
 */
export function createError(name, message, httpStatus) {
    const error = new Error(message);
    error.name = name;
    error.httpStatus = httpStatus;
    return error;
}

/**
 * Wirft einen Fehler mit HTTP-Statuscode.
 * @param {string} name Fehlername
 * @param {string} message Fehlermeldung
 * @param {number} httpStatus HTTP-Statuscode
 */
export function throwError(name, message, httpStatus = 400) {
    throw createError(name, message, httpStatus);
}

/**
 * Prüft, ob ein Wert leer ist.
 * @param {unknown} value Zu prüfender Wert
 * @returns {boolean}
 */
export function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}

/**
 * Wandelt eine Pfad-ID in eine positive Ganzzahl um.
 * @param {string} value Wert aus dem Request-Pfad
 * @returns {number}
 */
export function parseId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id < 1) {
        throwError("BadRequest", "Die ID muss eine positive Ganzzahl sein.", 400);
    }

    return id;
}
