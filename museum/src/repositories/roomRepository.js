/** datenbankzugriff für räume. */
export class RoomRepository {
    /** erstellt das repository. */
    constructor(db) {
        this.db = db;
    }

    /** gibt alle räume zurück. */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM rooms ORDER BY id");
        return rows.map(mapRoom);
    }

    /** sucht einen raum per id. */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM rooms WHERE id = ?", id);
        return row ? mapRoom(row) : undefined;
    }

    /** legt einen raum an. */
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

    /** ersetzt einen raum. */
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

    /** löscht einen raum. */
    async delete(id) {
        const result = await this.db.run("DELETE FROM rooms WHERE id = ?", id);
        return result.changes > 0;
    }
}

/** wandelt eine datenbankzeile in die API-darstellung um. */
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
