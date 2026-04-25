/**
 * Datenbankzugriff für Incidents.
 */
export class IncidentRepository {
    /**
     * @param {import("sqlite").Database} db sqlite-Datenbank
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Gibt alle Incidents zurück.
     * @returns {Promise<object[]>}
     */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM incidents ORDER BY id");
        return rows.map(mapIncident);
    }

    /**
     * Sucht ein Incident anhand seiner ID.
     * @param {number} id Incident-ID
     * @returns {Promise<object|undefined>}
     */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM incidents WHERE id = ?", id);
        return row ? mapIncident(row) : undefined;
    }

    /**
     * Legt ein Incident an.
     * @param {object} incident Incidentdaten
     * @returns {Promise<object>}
     */
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

    /**
     * Aktualisiert Status und Beschreibung.
     * @param {number} id Incident-ID
     * @param {object} incident Neue Incidentdaten
     * @returns {Promise<object|undefined>}
     */
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

    /**
     * Löscht ein Incident.
     * @param {number} id Incident-ID
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const result = await this.db.run("DELETE FROM incidents WHERE id = ?", id);
        return result.changes > 0;
    }

    /**
     * Löscht Incidents eines gelöschten Raums.
     * @param {number} roomId Raum-ID
     * @returns {Promise<number>}
     */
    async deleteByRoomId(roomId) {
        const result = await this.db.run("DELETE FROM incidents WHERE room_id = ?", roomId);
        return result.changes;
    }

    /**
     * Entfernt den Bezug auf ein gelöschtes Exponat.
     * @param {number} exhibitId Exponat-ID
     * @returns {Promise<number>}
     */
    async clearExhibitId(exhibitId) {
        const result = await this.db.run(
            "UPDATE incidents SET exhibit_id = NULL WHERE exhibit_id = ?",
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
