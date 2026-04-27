// KI-Hinweis: Prompt zur Datenbank-Dokumentation; Kommentar ergänzt, der Schemaaufbau und SQLite-Initialisierung benennt.
import sqlite3 from "sqlite3";
import { open } from "sqlite";

/** öffnet die sqlite-datenbank und legt das museum-schema an. */
export async function initializeDatabase(filename = "museum.sqlite") {
    const db = await open({
        filename,
        driver: sqlite3.Database,
    });

    await db.exec("PRAGMA foreign_keys = ON");
    await db.exec(`
        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            floor INTEGER NOT NULL,
            theme TEXT,
            is_monitored INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE TABLE IF NOT EXISTS exhibits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            artist TEXT,
            estimated_value REAL,
            room_id INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            FOREIGN KEY (room_id) REFERENCES rooms(id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_exhibits_room_id ON exhibits(room_id);
    `);

    return db;
}
