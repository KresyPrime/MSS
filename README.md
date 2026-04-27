# Museum Security System

Projekt fuer die Portfolioaufgabe in Verteilte Systeme.

Das System besteht aus zwei Microservices:

| Service | Port | Aufgabe |
| --- | ---: | --- |
| Museum Service | `9001` | Verwaltung von Raeumen und Exponaten |
| Security Service | `9002` | Verwaltung von Alerts und Incidents |

Jeder Microservice besitzt eine eigene SQLite-Datenbank. Der Security Service greift nur lesend auf den Museum Service zu.

## Start mit Docker Compose

Im Hauptverzeichnis starten:

```bash
docker compose up --build
```

Falls Docker nur mit Administratorrechten funktioniert:

```bash
sudo docker compose up --build
```

Danach laufen die Services hier:

```text
http://localhost:9001
http://localhost:9002
```

Healthchecks:

```text
http://localhost:9001/health
http://localhost:9002/health
```

Stoppen:

```bash
docker compose down
```

Falls mit `sudo` gestartet wurde:

```bash
sudo docker compose down
```

Die SQLite-Dateien liegen in Docker-Volumes. Zum Loeschen der Volumes:

```bash
docker compose down -v
```

## OpenAPI

Die REST-Schnittstellen sind hier beschrieben:

```text
museum/openapi.yaml
security/openapi.yaml
```

Die Dateien koennen im Swagger Editor importiert werden.

## Lokaler Start ohne Docker

Nur falls Docker nicht verwendet wird.

Museum Service:

```bash
cd museum
cp .env.example .env
npm ci
npm start
```

Security Service in einem zweiten Terminal:

```bash
cd security
cp .env.example .env
npm ci
npm start
```

## Hinweis zur Abgabe

Vor dem Packen der Abgabe sollten keine `node_modules`-Ordner enthalten sein.

Fuer Aufgabe 4a gehoert ausserdem ein kurzes Video zur Abgabe. Darin sollte gezeigt werden:

- Aufbau der beiden Dockerfiles
- Aufbau der `docker-compose.yml`
- Start mit `docker compose up --build`
- kurzer Aufruf der Healthchecks
- Stoppen mit `docker compose down`
