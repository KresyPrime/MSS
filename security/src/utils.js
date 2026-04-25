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