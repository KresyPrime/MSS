/** datenbankzugriff für alerts. */
export class AlertRepository {
    /** erstellt das repository. */
    constructor(db) {
        this.db = db;
    }

    /** gibt alle alerts zurück. */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM alerts ORDER BY id");
        return rows.map(mapAlert);
    }

    /** sucht einen alert per id. */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM alerts WHERE id = ?", id);
        return row ? mapAlert(row) : undefined;
    }

    /** legt einen alert an. */
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

    /** löscht alerts eines gelöschten raums. */
    async deleteByRoomId(roomId) {
        const result = await this.db.run("DELETE FROM alerts WHERE room_id = ?", roomId);
        return result.changes;
    }

    /** entfernt den bezug auf ein gelöschtes exponat. */
    async clearExhibitId(exhibitId) {
        const result = await this.db.run(
            "UPDATE alerts SET exhibit_id = NULL WHERE exhibit_id = ?",
            exhibitId,
        );
        return result.changes;
    }
}

/** wandelt eine datenbankzeile in die API-darstellung um. */
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
