# OKR Docker Stack — Advanced

Inclou:
- **MySQL** amb **volum persistent**
- **Redis** per a *rate limiting*
- Opcions de *reverse proxy* amb TLS automàtic:
  - **Traefik** (Let's Encrypt ACME)
  - **Caddy** (auto-TLS)

## Ús bàsic (local)
```bash
cp .env.example .env
docker compose up -d --build
# Frontend: http://localhost:8080
# Backend:  http://localhost:8000/docs
# MySQL:    localhost:3306
# Redis:    localhost:6379
```
> La BBDD i Redis persisteixen en volums: `mysql_data`, `redis_data`.

## Producció amb **Traefik**
1) Defineix variables al `.env`:
```
DOMAIN=okr.example.com
API_DOMAIN=api.okr.example.com
ACME_EMAIL=tu@exemple.com
MYSQL_ROOT_PASSWORD=...
MYSQL_DATABASE=okr_evaluator
MYSQL_USER=okr
MYSQL_PASSWORD=...
OPENAI_API_KEY=sk-...
```
2) Llença:
```bash
docker compose -f docker-compose.prod-traefik.yml up -d --build
```
- Pàgina: `https://okr.example.com`
- API: `https://api.okr.example.com`

## Producció amb **Caddy**
1) Defineix `.env` amb `DOMAIN` i `API_DOMAIN` i credencials com abans.
2) Llença:
```bash
docker compose -f docker-compose.prod-caddy.yml up -d --build
```
- Pàgina: `https://okr.example.com`
- API: `https://api.okr.example.com`

## Rate limiting
- Activat per defecte a l'API (`REDIS_URL` + finestres i llindars).
- Variables:
  - `RATE_LIMIT_WINDOW_SECONDS` (per defecte 60)
  - `RATE_LIMIT_MAX_REQUESTS` (per defecte 60)
- Desactivar: elimina `REDIS_URL` o treu la dependència al *router*.

## Persistència
- Dades de **MySQL** al volum `mysql_data`.
- Dades de **Redis** al volum `redis_data`.
- Per esborrar-les: `docker volume rm <nom>` després d'aturar l'stack.
