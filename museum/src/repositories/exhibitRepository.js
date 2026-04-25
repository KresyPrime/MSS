/**
 * Datenbankzugriff für Exponate.
 */
export class ExhibitRepository {
    /**
     * @param {import("sqlite").Database} db sqlite-Datenbank
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Gibt alle Exponate zurück.
     * @returns {Promise<object[]>}
     */
    async findAll() {
        const rows = await this.db.all("SELECT * FROM exhibits ORDER BY id");
        return rows.map(mapExhibit);
    }

    /**
     * Gibt alle Exponate eines Raumes zurück.
     * @param {number} roomId Raum-ID
     * @returns {Promise<object[]>}
     */
    async findByRoomId(roomId) {
        const rows = await this.db.all(
            "SELECT * FROM exhibits WHERE room_id = ? ORDER BY id",
            roomId,
        );
        return rows.map(mapExhibit);
    }

    /**
     * Sucht ein Exponat anhand seiner ID.
     * @param {number} id Exponat-ID
     * @returns {Promise<object|undefined>}
     */
    async findById(id) {
        const row = await this.db.get("SELECT * FROM exhibits WHERE id = ?", id);
        return row ? mapExhibit(row) : undefined;
    }

    /**
     * Legt ein Exponat an.
     * @param {object} exhibit Exponatdaten
     * @returns {Promise<object>}
     */
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

    /**
     * Ersetzt ein Exponat vollständig.
     * @param {number} id Exponat-ID
     * @param {object} exhibit Neue Exponatdaten
     * @returns {Promise<object|undefined>}
     */
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

    /**
     * Löscht ein Exponat.
     * @param {number} id Exponat-ID
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const result = await this.db.run("DELETE FROM exhibits WHERE id = ?", id);
        return result.changes > 0;
    }
}

/**
 * Wandelt eine Datenbankzeile in die API-Darstellung um.
 * @param {object} row Datenbankzeile
 * @returns {object}
 */
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
