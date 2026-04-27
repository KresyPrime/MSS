/** datenbankzugriff für incidents. */
export class IncidentRepository {
    /** erstellt das repository. */
    constructor(db) {
        this.db = db;
    }

    /** gibt alle incidents zurück. */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM incidents ORDER BY id");
        return rows.map(mapIncident);
    }

    /** sucht ein incident per id. */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM incidents WHERE id = ?", id);
        return row ? mapIncident(row) : undefined;
    }

    /** gibt alle incidents zu einem alert zurück. */
    async findByAlertId(alertId) {
        const rows = await this.db.all(
            "SELECT * FROM incidents WHERE alert_id = ? ORDER BY id",
            alertId,
        );
        return rows.map(mapIncident);
    }

    /** legt ein incident an. */
    async create(incident) {
        const result = await this.db.run(
            `INSERT INTO incidents (
                alert_id, room_id, exhibit_id, type, cause, status, severity, description, resolved_at, created_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            incident.alertId ?? null,
            incident.roomId,
            incident.exhibitId ?? null,
            incident.type,
            incident.cause,
            incident.status,
            incident.severity,
            incident.description,
            incident.resolvedAt ?? null,
            new Date().toISOString(),
        );

        return this.findById(result.lastID);
    }

    /** aktualisiert status und beschreibung. */
    async update(id, incident) {
        const result = await this.db.run(
            "UPDATE incidents SET status = ?, description = ?, resolved_at = ? WHERE id = ?",
            incident.status,
            incident.description,
            incident.resolvedAt ?? null,
            id,
        );

        return result.changes === 0 ? undefined : this.findById(id);
    }

    /** löscht ein incident. */
    async delete(id) {
        const result = await this.db.run("DELETE FROM incidents WHERE id = ?", id);
        return result.changes > 0;
    }

    /** löscht incidents eines gelöschten raums. */
    async deleteByRoomId(roomId) {
        const result = await this.db.run("DELETE FROM incidents WHERE room_id = ?", roomId);
        return result.changes;
    }

    /** entfernt den bezug auf ein gelöschtes exponat. */
    async clearExhibitId(exhibitId) {
        const result = await this.db.run(
            "UPDATE incidents SET exhibit_id = NULL WHERE exhibit_id = ?",
            exhibitId,
        );
        return result.changes;
    }
}

/** wandelt eine datenbankzeile in die API-darstellung um. */
export function mapIncident(row) {
    return {
        id: row.id,
        alertId: row.alert_id ?? undefined,
        roomId: row.room_id,
        exhibitId: row.exhibit_id ?? undefined,
        type: row.type,
        cause: row.cause,
        status: row.status,
        severity: row.severity,
        description: row.description,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at ?? undefined,
        _links: {
            self: { href: `/incidents/${row.id}`, method: "GET" },
            update: { href: `/incidents/${row.id}`, method: "PUT" },
            delete: { href: `/incidents/${row.id}`, method: "DELETE" },
            alert: row.alert_id ? { href: `/alerts/${row.alert_id}`, method: "GET" } : undefined,
        },
    };
}
