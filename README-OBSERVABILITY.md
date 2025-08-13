# Observabilitat (Loki + Promtail + Grafana)

Aquest pack amplia l'stack amb:
- **Loki** (emmagatzematge de logs, amb persistència)
- **Promtail** (ingesta de logs de *tots els contenidors* amb label `promtail=true`)
- **Grafana** (visualització; user/pass per defecte `admin/admin`)

## Ús
```bash
cp .env.example .env
docker compose up -d --build
# Frontend: http://localhost:8080
# Backend:  http://localhost:8000/docs
# Grafana:  http://localhost:3000  (admin/admin)
```
Els serveis `db`, `redis`, `api` i `web` tenen la label `promtail=true`, per tant Promtail els agafa automàticament.

## Consultes bàsiques a Grafana (Loki)
- Tots els logs: `{service=~"api|web|db|redis"}`
- Només API: `{service="api"}`
- Només Nginx: `{service="web"}`

## Persistència
- **Loki**: volum `loki_data`
- **Grafana**: volum `grafana_data`
- **MySQL**: volum `mysql_data`
- **Redis**: volum `redis_data`

> Si vols capar volum de logs o rotació, pots ajustar la configuració del *daemon* de Docker o afegir *log-opts* als serveis.
