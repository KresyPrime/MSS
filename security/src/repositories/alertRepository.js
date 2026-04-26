/**
 * Datenbankzugriff für Alerts.
 */
export class AlertRepository {
    /**
     * @param {import("sqlite").Database} db sqlite-Datenbank
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Gibt alle Alerts zurück.
     * @returns {Promise<object[]>}
     */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM alerts ORDER BY id");
        return rows.map(mapAlert);
    }

    /**
     * Sucht einen Alert anhand seiner ID.
     * @param {number} id Alert-ID
     * @returns {Promise<object|undefined>}
     */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM alerts WHERE id = ?", id);
        return row ? mapAlert(row) : undefined;
    }

    /**
     * Legt einen Alert an.
     * @param {object} alert Alertdaten
     * @returns {Promise<object>}
     */
    async create(alert) {
        const result = await this.db.run(
            `INSERT INTO alerts (room_id, exhibit_id, type, cause, timestamp, message, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            alert.roomId,
            alert.exhibitId ?? null,
            alert.type,
            alert.cause,
            alert.timestamp,
            alert.message,
            new Date().toISOString(),
        );

        return this.findById(result.lastID);
    }

    /**
     * Löscht Alerts eines gelöschten Raums.
     * @param {number} roomId Raum-ID
     * @returns {Promise<number>}
     */
    async deleteByRoomId(roomId) {
        const result = await this.db.run("DELETE FROM alerts WHERE room_id = ?", roomId);
        return result.changes;
    }

    /**
     * Entfernt den Bezug auf ein gelöschtes Exponat.
     * @param {number} exhibitId Exponat-ID
     * @returns {Promise<number>}
     */
    async clearExhibitId(exhibitId) {
        const result = await this.db.run(
            "UPDATE alerts SET exhibit_id = NULL WHERE exhibit_id = ?",
            exhibitId,
        );
        return result.changes;
    }
}

/**
 * Wandelt eine Datenbankzeile in die API-Darstellung um.
 * @param {object} row Datenbankzeile
 * @returns {object}
 */
export function mapAlert(row) {
    return {
        id: row.id,
        roomId: row.room_id,
        exhibitId: row.exhibit_id ?? undefined,
        type: row.type,
        cause: row.cause,
        timestamp: row.timestamp,
        message: row.message,
        createdAt: row.created_at,
        _links: {
            self: { href: `/alerts/${row.id}`, method: "GET" },
            incidents: { href: `/alerts/${row.id}/incidents`, method: "GET" },
        },
    };
}
