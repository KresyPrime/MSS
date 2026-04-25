/**
 * Datenbankzugriff für Museumsräume.
 */
export class RoomRepository {
    /**
     * @param {import("sqlite").Database} db sqlite-Datenbank
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Gibt alle Räume zurück.
     * @returns {Promise<object[]>}
     */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM rooms ORDER BY id");
        return rows.map(mapRoom);
    }

    /**
     * Sucht einen Raum anhand seiner ID.
     * @param {number} id Raum-ID
     * @returns {Promise<object|undefined>}
     */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM rooms WHERE id = ?", id);
        return row ? mapRoom(row) : undefined;
    }

    /**
     * Legt einen Raum an.
     * @param {object} room Raumdaten
     * @returns {Promise<object>}
     */
    async create(room) {
        const result = await this.db.run(
            "INSERT INTO rooms (name, floor, theme, is_monitored, created_at) VALUES (?, ?, ?, ?, ?)",
            room.name,
            room.floor,
            room.theme ?? null,
            room.isMonitored ? 1 : 0,
            new Date().toISOString(),
        );

        return this.findById(result.lastID);
    }

    /**
     * Ersetzt einen Raum vollständig.
     * @param {number} id Raum-ID
     * @param {object} room Neue Raumdaten
     * @returns {Promise<object|undefined>}
     */
    async replace(id, room) {
        const result = await this.db.run(
            "UPDATE rooms SET name = ?, floor = ?, theme = ?, is_monitored = ? WHERE id = ?",
            room.name,
            room.floor,
            room.theme ?? null,
            room.isMonitored ? 1 : 0,
            id,
        );

        return result.changes === 0 ? undefined : this.findById(id);
    }

    /**
     * Löscht einen Raum.
     * @param {number} id Raum-ID
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const result = await this.db.run("DELETE FROM rooms WHERE id = ?", id);
        return result.changes > 0;
    }
}

/**
 * Wandelt eine Datenbankzeile in die API-Darstellung um.
 * @param {object} row Datenbankzeile
 * @returns {object}
 */
export function mapRoom(row) {
    return {
        id: row.id,
        name: row.name,
        floor: row.floor,
        theme: row.theme ?? undefined,
        isMonitored: Boolean(row.is_monitored),
        createdAt: row.created_at,
        _links: {
            self: { href: `/rooms/${row.id}`, method: "GET" },
            update: { href: `/rooms/${row.id}`, method: "PUT" },
            delete: { href: `/rooms/${row.id}`, method: "DELETE" },
            exhibits: { href: `/rooms/${row.id}/exhibits`, method: "GET" },
        },
    };
}
