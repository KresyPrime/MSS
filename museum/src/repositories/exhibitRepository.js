/** datenbankzugriff für exponate. */
export class ExhibitRepository {
    /** erstellt das repository. */
    constructor(db) {
        this.db = db;
    }

    /** gibt alle exponate zurück. */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM exhibits ORDER BY id");
        return rows.map(mapExhibit);
    }

    /** gibt alle exponate eines raums zurück. */
    async findByRoomId(roomId) {
        const rows = await this.db.all(
            "SELECT * FROM exhibits WHERE room_id = ? ORDER BY id",
            roomId,
        );
        return rows.map(mapExhibit);
    }

    /** sucht ein exponat per id. */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM exhibits WHERE id = ?", id);
        return row ? mapExhibit(row) : undefined;
    }

    /** legt ein exponat an. */
    async create(exhibit) {
        const result = await this.db.run(
            "INSERT INTO exhibits (name, artist, estimated_value, room_id, created_at) VALUES (?, ?, ?, ?, ?)",
            exhibit.name,
            exhibit.artist ?? null,
            exhibit.estimatedValue ?? null,
            exhibit.roomId,
            new Date().toISOString(),
        );

        return this.findById(result.lastID);
    }

    /** ersetzt ein exponat. */
    async replace(id, exhibit) {
        const result = await this.db.run(
            "UPDATE exhibits SET name = ?, artist = ?, estimated_value = ?, room_id = ? WHERE id = ?",
            exhibit.name,
            exhibit.artist ?? null,
            exhibit.estimatedValue ?? null,
            exhibit.roomId,
            id,
        );

        return result.changes === 0 ? undefined : this.findById(id);
    }

    /** löscht ein exponat. */
    async delete(id) {
        const result = await this.db.run("DELETE FROM exhibits WHERE id = ?", id);
        return result.changes > 0;
    }
}

/** wandelt eine datenbankzeile in die API-darstellung um. */
export function mapExhibit(row) {
    return {
        id: row.id,
        name: row.name,
        artist: row.artist ?? undefined,
        estimatedValue: row.estimated_value ?? undefined,
        roomId: row.room_id,
        createdAt: row.created_at,
        _links: {
            self: { href: `/exhibits/${row.id}`, method: "GET" },
            update: { href: `/exhibits/${row.id}`, method: "PUT" },
            delete: { href: `/exhibits/${row.id}`, method: "DELETE" },
            room: { href: `/rooms/${row.room_id}`, method: "GET" },
        },
    };
}
