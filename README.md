# Museum Security System (MSS)

Das **Museum Security System** ist eine verteilte Backend-Anwendung mit zwei Microservices. Die Anwendung verwaltet Museumsdaten und sicherheitsrelevante Ereignisse getrennt voneinander. Dadurch sind fachliche Museumsverwaltung und Sicherheitsüberwachung sauber voneinander abgegrenzt.

Das Projekt wurde im Rahmen der Portfolioaufgaben für **Verteilte Systeme** erstellt. Im Mittelpunkt stehen REST-Webservices, eigene Datenbanken pro Microservice, fehlertolerante Kommunikation zwischen Services, MQTT-Events und ein gemeinsamer Start über Docker Compose.

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Architektur](#architektur)
- [Microservices](#microservices)
- [Projektstruktur](#projektstruktur)
- [Voraussetzungen](#voraussetzungen)
- [Start mit Docker Compose](#start-mit-docker-compose)
- [Start ohne Docker](#start-ohne-docker)
- [Konfiguration](#konfiguration)
- [REST-Schnittstellen](#rest-schnittstellen)
- [Beispielhafter Testablauf](#beispielhafter-testablauf)
- [Kommunikation zwischen den Microservices](#kommunikation-zwischen-den-microservices)
- [MQTT-Events](#mqtt-events)
- [OpenAPI-Dokumentation](#openapi-dokumentation)
- [Hinweise zur Abgabe](#hinweise-zur-abgabe)

## Überblick

Im Museum gibt es Räume und Exponate. Diese fachlichen Museumsdaten werden vom **Museum Service** verwaltet. Sicherheitsmeldungen, zum Beispiel Bewegungen, Glasbruch oder unbefugter Zutritt, werden vom **Security Service** verarbeitet.

Der Security Service prüft bei neuen Alerts und Incidents, ob der referenzierte Raum und optional das referenzierte Exponat im Museum Service existieren. Dabei greift er nur lesend auf den Museum Service zu. Änderungen an eigenen Daten werden zusätzlich als MQTT-Events veröffentlicht.

## Architektur

```text
+----------------------+          REST GET           +----------------------+
|   Security Service   | --------------------------> |    Museum Service    |
|                      |                             |                      |
| Alerts               |                             | Rooms                |
| Incidents            |                             | Exhibits             |
| eigene SQLite-DB     |                             | eigene SQLite-DB     |
+----------+-----------+                             +----------+-----------+
           |                                                    |
           | MQTT Events bei Änderungen                         | MQTT Events bei Änderungen
           v                                                    v
+---------------------------------------------------------------+
|                         MQTT Broker                            |
|             optional, Services laufen auch ohne Broker          |
+---------------------------------------------------------------+
```

Wichtig: Jeder Microservice besitzt seine eigene SQLite-Datenbank. Datenbankentitäten werden nicht zwischen den Services dupliziert. Der Security Service speichert deshalb nur Fremdschlüsselwerte wie `roomId` oder `exhibitId`, aber keine vollständigen Raum- oder Exponatdaten.

## Microservices

| Service | Port | Verantwortlichkeit | Entitäten |
| --- | ---: | --- | --- |
| Museum Service | `9001` | Verwaltung von Museumsdaten | `Room`, `Exhibit` |
| Security Service | `9002` | Verarbeitung von Sicherheitsmeldungen und Sicherheitsfällen | `Alert`, `Incident` |

## Projektstruktur

```text
MSS/
├── docker-compose.yml
├── README.md
├── museum/
│   ├── Dockerfile
│   ├── openapi.yaml
│   ├── package.json
│   ├── .env.example
│   └── src/
└── security/
    ├── Dockerfile
    ├── openapi.yaml
    ├── package.json
    ├── .env.example
    └── src/
```

## Voraussetzungen

Für den Start mit Docker Compose wird benötigt:

- Docker
- Docker Compose

Für den lokalen Start ohne Docker wird benötigt:

- Node.js
- npm

Die Services verwenden Node.js mit Express und SQLite. Die produktiven Docker-Images installieren nur die benötigten Abhängigkeiten und starten jeweils `npm start`.

## Start mit Docker Compose

Der einfachste Weg ist der Start über Docker Compose im Hauptverzeichnis des Projekts.

```bash
docker compose up --build
```

Falls Docker nur mit Administratorrechten funktioniert:

```bash
sudo docker compose up --build
```

Danach sind die Services unter folgenden URLs erreichbar:

| Service | URL |
| --- | --- |
| Museum Service | `http://localhost:9001` |
| Museum Healthcheck | `http://localhost:9001/health` |
| Security Service | `http://localhost:9002` |
| Security Healthcheck | `http://localhost:9002/health` |

Stoppen der Container:

```bash
docker compose down
```

Falls vorher mit `sudo` gestartet wurde:

```bash
sudo docker compose down
```

Die SQLite-Datenbanken werden in Docker-Volumes gespeichert. Dadurch bleiben die Daten auch nach einem Neustart der Container erhalten.

Falls die Datenbanken vollständig zurückgesetzt werden sollen:

```bash
docker compose down -v
```

## Start ohne Docker

Die Services können auch direkt mit Node.js gestartet werden. Dafür müssen beide Microservices in getrennten Terminals ausgeführt werden.

### 1. Museum Service starten

```bash
cd museum
cp .env.example .env
npm ci
npm start
```

Der Museum Service läuft danach standardmäßig auf:

```text
http://localhost:9001
```

### 2. Security Service starten

In einem zweiten Terminal:

```bash
cd security
cp .env.example .env
npm ci
npm start
```

Der Security Service läuft danach standardmäßig auf:

```text
http://localhost:9002
```

Wichtig: Der Security Service benötigt die Adresse des Museum Service in der Umgebungsvariable `MUSEUM_SERVICE_URL`.

## Konfiguration

Die Services lesen ihre Konfiguration über Umgebungsvariablen ein. Für den lokalen Start liegen Beispielkonfigurationen in den jeweiligen `.env.example`-Dateien.

### Museum Service

| Variable | Bedeutung | Beispiel |
| --- | --- | --- |
| `LISTEN_HOST` | Host, auf dem der Service lauscht | `127.0.0.1` |
| `LISTEN_PORT` | Port des Services | `9001` |
| `DATABASE_FILE` | Pfad zur SQLite-Datenbank | `museum.sqlite` |
| `MQTT_BROKER` | Adresse des MQTT-Brokers, optional | leer oder z. B. `mqtt://localhost:1883` |
| `MQTT_USERNAME` | MQTT-Benutzername, optional | leer |
| `MQTT_PASSWORD` | MQTT-Passwort, optional | leer |
| `MQTT_TOPIC_PREFIX` | Prefix für MQTT-Topics | `mss/events` |

### Security Service

| Variable | Bedeutung | Beispiel |
| --- | --- | --- |
| `LISTEN_HOST` | Host, auf dem der Service lauscht | `127.0.0.1` |
| `LISTEN_PORT` | Port des Services | `9002` |
| `DATABASE_FILE` | Pfad zur SQLite-Datenbank | `security.sqlite` |
| `MUSEUM_SERVICE_URL` | URL des Museum Service | `http://127.0.0.1:9001` |
| `MQTT_BROKER` | Adresse des MQTT-Brokers, optional | leer oder z. B. `mqtt://localhost:1883` |
| `MQTT_USERNAME` | MQTT-Benutzername, optional | leer |
| `MQTT_PASSWORD` | MQTT-Passwort, optional | leer |
| `MQTT_TOPIC_PREFIX` | Prefix für MQTT-Topics | `mss/events` |

Bei Docker Compose wird intern nicht `localhost` für die Kommunikation zwischen Containern verwendet. Der Security Service erreicht den Museum Service über:

```text
http://museum:9001
```

## REST-Schnittstellen

### Museum Service

Basis-URL:

```text
http://localhost:9001
```

| Methode | Pfad | Beschreibung |
| --- | --- | --- |
| `GET` | `/` | Einstiegspunkt mit Service-Links |
| `GET` | `/health` | Healthcheck |
| `GET` | `/rooms` | Alle Räume abrufen |
| `POST` | `/rooms` | Neuen Raum anlegen |
| `GET` | `/rooms/{id}` | Einzelnen Raum abrufen |
| `PUT` | `/rooms/{id}` | Raum ersetzen |
| `DELETE` | `/rooms/{id}` | Raum löschen |
| `GET` | `/rooms/{id}/exhibits` | Exponate eines Raums abrufen |
| `GET` | `/exhibits` | Alle Exponate abrufen |
| `POST` | `/exhibits` | Neues Exponat anlegen |
| `GET` | `/exhibits/{id}` | Einzelnes Exponat abrufen |
| `PUT` | `/exhibits/{id}` | Exponat ersetzen |
| `DELETE` | `/exhibits/{id}` | Exponat löschen |

### Security Service

Basis-URL:

```text
http://localhost:9002
```

| Methode | Pfad | Beschreibung |
| --- | --- | --- |
| `GET` | `/` | Einstiegspunkt mit Service-Links |
| `GET` | `/health` | Healthcheck |
| `GET` | `/alerts` | Alle Alerts abrufen |
| `POST` | `/alerts` | Alert anlegen und automatisch erstes Incident erzeugen |
| `GET` | `/alerts/{id}` | Einzelnen Alert abrufen |
| `GET` | `/alerts/{id}/incidents` | Incidents zu einem Alert abrufen |
| `GET` | `/incidents` | Alle Incidents abrufen |
| `POST` | `/incidents` | Manuelles Incident anlegen |
| `GET` | `/incidents/{id}` | Einzelnes Incident abrufen |
| `PUT` | `/incidents/{id}` | Incident aktualisieren |
| `DELETE` | `/incidents/{id}` | Incident löschen |

## Beispielhafter Testablauf

Die folgenden Befehle können nach dem Start mit Docker Compose ausgeführt werden.

### 1. Healthchecks prüfen

```bash
curl http://localhost:9001/health
curl http://localhost:9002/health
```

### 2. Raum im Museum Service anlegen

```bash
curl -X POST http://localhost:9001/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Saal A",
    "floor": 1,
    "theme": "Antike Kunst",
    "isMonitored": true
  }'
```

### 3. Exponat für den Raum anlegen

Im Beispiel wird angenommen, dass der zuvor angelegte Raum die ID `1` erhalten hat.

```bash
curl -X POST http://localhost:9001/exhibits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Römische Vase",
    "artist": "Unbekannt",
    "estimatedValue": 25000,
    "roomId": 1
  }'
```

### 4. Alert im Security Service anlegen

Der Security Service prüft dabei lesend beim Museum Service, ob `roomId` und `exhibitId` existieren.

```bash
curl -X POST http://localhost:9002/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": 1,
    "exhibitId": 1,
    "type": "motion",
    "cause": "unknown",
    "timestamp": "2026-04-27T12:00:00.000Z",
    "message": "Bewegung im überwachten Raum erkannt."
  }'
```

Beim Anlegen eines Alerts wird automatisch ein erstes Incident erzeugt.

### 5. Alerts und Incidents abrufen

```bash
curl http://localhost:9002/alerts
curl http://localhost:9002/incidents
curl http://localhost:9002/alerts/1/incidents
```

### 6. Incident aktualisieren

```bash
curl -X PUT http://localhost:9002/incidents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "investigating",
    "description": "Sicherheitsdienst prüft den Raum."
  }'
```

### 7. Incident als resolved markieren

Wenn der Status `resolved` verwendet wird, muss `resolvedAt` gesetzt werden.

```bash
curl -X PUT http://localhost:9002/incidents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "description": "Vorfall wurde geprüft und abgeschlossen.",
    "resolvedAt": "2026-04-27T12:30:00.000Z"
  }'
```

## Kommunikation zwischen den Microservices

Der Security Service verwendet den Museum Service nur für lesende Zugriffe. Beim Anlegen von Alerts und Incidents wird geprüft, ob die referenzierten Museumsdaten vorhanden sind.

Beispiele:

- `roomId` muss auf einen existierenden Raum im Museum Service verweisen.
- `exhibitId` ist optional, muss aber bei Angabe auf ein existierendes Exponat verweisen.
- Wenn ein Exponat angegeben wird, muss es zum angegebenen Raum passen.

Änderungen an Museumsdaten werden nicht direkt durch den Security Service ausgelöst. Dadurch bleibt die Kopplung zwischen den Services gering.

## MQTT-Events

Bei Änderungen an eigenen Daten veröffentlichen die Services MQTT-Events. Dadurch können andere Services auf Änderungen reagieren, ohne dass direkte Schreibzugriffe zwischen Microservices nötig sind.

Falls kein MQTT-Broker konfiguriert ist, laufen die Services trotzdem weiter. In diesem Fall werden die Events nur auf der Konsole ausgegeben.

Beispielhafte Event-Struktur:

```json
{
  "event": "create",
  "entity": "Alert",
  "id": 1
}
```

Der Topic-Prefix wird über `MQTT_TOPIC_PREFIX` konfiguriert. Standardmäßig wird verwendet:

```text
mss/events
```

## OpenAPI-Dokumentation

Die REST-Schnittstellen sind als OpenAPI-Dateien dokumentiert:

| Service | OpenAPI-Datei |
| --- | --- |
| Museum Service | `museum/openapi.yaml` |
| Security Service | `security/openapi.yaml` |

Die Dateien können zum Beispiel im Swagger Editor geöffnet werden:

```text
https://editor.swagger.io/
```

Dort kann die jeweilige Datei über `File -> Import File` geladen und geprüft werden.