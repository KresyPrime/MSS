# Museum Security System

Das Museum Security System ist eine kleine verteilte Backend-Anwendung für ein Museum. Der Museum Service verwaltet Räume und Exponate. Der Security Service verarbeitet Sicherheitsmeldungen und daraus entstehende Incidents.

Das System besteht aus zwei getrennten Microservices:

| Service | Port | Aufgabe |
| --- | ---: | --- |
| Museum Service | `9001` | Verwaltung von Räumen und Exponaten |
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

Die SQLite-Dateien liegen in Docker-Volumes. Zum Löschen der Volumes:

```bash
docker compose down -v
```

## OpenAPI

Die REST-Schnittstellen sind hier beschrieben:

```text
museum/openapi.yaml
security/openapi.yaml
```

Die Dateien können im Swagger Editor importiert werden.
