import sqlite3 from "sqlite3";
import { open } from "sqlite";

/** öffnet die sqlite-datenbank und legt das security-schema an. */
export async function initializeDatabase(filename = "security.sqlite") {
    const db = await open({
        filename,
        driver: sqlite3.Database,
    });

    await db.exec("PRAGMA foreign_keys = ON");
    await db.exec(`
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            exhibit_id INTEGER,
            type TEXT NOT NULL,
            cause TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id INTEGER,
            room_id INTEGER NOT NULL,
            exhibit_id INTEGER,
            type TEXT NOT NULL,
            cause TEXT NOT NULL,
            status TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            resolved_at TEXT,
            FOREIGN KEY (alert_id) REFERENCES alerts(id)
                ON UPDATE CASCADE
                ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_alerts_room_id ON alerts(room_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_exhibit_id ON alerts(exhibit_id);
        CREATE INDEX IF NOT EXISTS idx_incidents_alert_id ON incidents(alert_id);
        CREATE INDEX IF NOT EXISTS idx_incidents_room_id ON incidents(room_id);
        CREATE INDEX IF NOT EXISTS idx_incidents_exhibit_id ON incidents(exhibit_id);
    `);

    return db;
}
