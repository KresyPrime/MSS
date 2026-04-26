# Museum Security System

Das Projekt besteht aus zwei kleinen Backend-Services fuer ein Museum. Der erste Service verwaltet die
Museumsdaten, der zweite Service kuemmert sich um Sicherheitsmeldungen.

Die Idee ist: Im Museum gibt es Räume und Exponate. Wenn ein Sicherheitssystem etwas meldet, wird daraus im
Security-Service ein Alert gespeichert. Zu einem Alert koennen dann ein oder mehrere Incidents gehoeren, die
bearbeitet werden koennen.

## Aufbau

### museum

Der Museum-Service enthält:

- Räume
- Exponate
- die Zuordnung, welches Exponat in welchem Raum steht

Er läuft standardmässig auf Port `9001` und benutzt eine eigene sqlite-Datenbank.

### security

Der Security-Service enthält:

- Alerts
- Incidents

Alerts sind als Protokoll der eingehenden Meldungen gedacht. Deshalb koennen sie angelegt und gelesen, aber nicht
geändert oder geloescht werden. Incidents sind dagegen die eigentlichen Sicherheitsfälle, die bearbeitet werden.

Wenn ein neuer Alert angelegt wird, erstellt der Service automatisch ein erstes Incident. Danach koennen weitere
Incidents mit derselben `alertId` angelegt werden.

Der Security-Service läuft standardmässig auf Port `9002` und benutzt ebenfalls eine eigene sqlite-Datenbank.

## Schnittstellen

Die REST-Schnittstellen sind hier beschrieben:

- `museum/openapi.yaml`
- `security/openapi.yaml`

Zum Anschauen kann man die Dateien im Swagger Editor ueber `File -> Import File` laden.

Wichtige URLs nach dem Start:

- `http://localhost:9001`
- `http://localhost:9001/health`
- `http://localhost:9002`
- `http://localhost:9002/health`

## Kommunikation

Der Security-Service prueft beim Anlegen von Alerts und Incidents, ob die angegebene `roomId` und optional die
`exhibitId` im Museum-Service existieren. Dafuer wird nur lesend auf den Museum-Service zugegriffen.

Die Adresse des Museum-Service steht in der Variable `MUSEUM_SERVICE_URL`.

Bei änderungen werden MQTT-Events erzeugt. Wenn kein MQTT-Broker eingetragen ist, werden die Events nur in der
Konsole ausgegeben. Dadurch laufen die Services auch ohne Broker weiter.

## Start mit Docker Compose

Im Hauptverzeichnis:

```bash
docker compose up --build
```

Falls Docker auf dem Rechner nur mit Administratorrechten funktioniert:

```bash
sudo docker compose up --build
```

Danach laufen die Services auf:

- Museum: `http://localhost:9001`
- Security: `http://localhost:9002`

Stoppen:

```bash
docker compose down
```

Oder, falls vorher mit `sudo` gestartet wurde:

```bash
sudo docker compose down
```

## Start ohne Docker

Museum-Service:

```bash
cd museum
npm ci
npm start
```

Security-Service in einem zweiten Terminal:

```bash
cd security
npm ci
npm start
```

Die Beispielkonfigurationen liegen in:

- `museum/.env.example`
- `security/.env.example`

## Kurzer Funktionstest

Nach dem Start kann man zuerst die Healthchecks aufrufen:

```bash
curl http://localhost:9001/health
curl http://localhost:9002/health
```

Ein sinnvoller Testablauf ist:

1. Raum im Museum-Service anlegen.
2. Exponat fuer diesen Raum anlegen.
3. Alert im Security-Service anlegen.
4. Incidents zu diesem Alert abrufen.
5. Ein weiteres Incident mit derselben `alertId` anlegen.
6. Incident aktualisieren oder loeschen.

## Vor der Abgabe

Vor dem Packen der ZIP-Datei sollen die `node_modules`-Ordner geloescht werden:

```bash
rm -rf museum/node_modules security/node_modules
```

Die ZIP-Datei sollte den Quellcode, die OpenAPI-Dateien, die Docker-Dateien und diese README enthalten.
