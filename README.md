# Guia d'Execució i Debug de l'Stack OKR

Aquesta guia explica com arrencar, parar i debugar l'stack OKR que utilitza Docker Compose, aix铆 com verificar l'estat dels serveis.

---
# OKR Docker Stack APM

Aquest projecte desplega una aplicació OKR amb monitorització (APM) utilitzant **Docker Compose**.  
Inclou:
- **Frontend** (Vite + React servit amb Nginx)
- **Backend** (FastAPI + OpenAI API)
- **MySQL**
- **Redis**
- **Grafana**
- **Prometheus**
- **Loki + Promtail** (logs)
- Altres serveis de suport

---

## 📦 1) Execució amb Docker (stack complet)

Des de la carpeta arrel del projecte (`docker-compose.yml`):

```bash
# Valida el fitxer compose
docker compose config

# Construeix i aixeca
docker compose up -d --build

# Comprova serveis
docker compose ps


| Servei      | Port Host | URL o accés                                              |
| ----------- | --------- | -------------------------------------------------------- |
| Frontend    | 8080      | [http://localhost:8080](http://localhost:8080)           |
| Backend API | 8000      | [http://localhost:8000/docs](http://localhost:8000/docs) |
| MySQL       | 3306      | localhost:3306 (si exposat)                              |
| Redis       | 6379      | localhost:6379 (si exposat)                              |
| Grafana     | 3000      | [http://localhost:3000](http://localhost:3000)           |
| Prometheus  | 9090      | [http://localhost:9090](http://localhost:9090)           |
| Loki        | 3100      | [http://localhost:3100](http://localhost:3100)           |


🧪 2) Smoke tests ràpids
Backend (FastAPI)
bash
Copy
Edit
curl http://localhost:8000/health
start http://localhost:8000/docs
### Prova de petició OKR:

curl -X POST http://localhost:8000/api/v1/okrs/evaluate \
  -H "Content-Type: application/json" \
  -d '{"objective":"Augmentar el NPS a 55 abans de Q4"}'

### Frontend
Obre http://localhost:8080 i fes una submissió de prova.

Si hi ha error a la crida API, comprova el nginx.conf i que el servei API estigui actiu.

### Redis

docker exec -it okr_api sh -lc "apk add redis && redis-cli -h redis ping"
### Loki

curl http://localhost:3100/ready
A Grafana → datasource Loki → consulta de logs.

🔍 3) Debug

### Veure logs

docker compose logs -f api
docker compose logs -f web
docker compose logs -f redis
docker compose logs -f loki

###Comprovar ports efectius

docker inspect okr_web --format='{{json .NetworkSettings.Ports}}'

### Provar serveis des de dins un contenidor

docker exec -it okr_api sh
curl http://api:8000/health



🖥 4) Execució en mode local (dev)

Backend (FastAPI)

cd backend
python -m venv .venv
source .venv/bin/activate  # o .venv\Scripts\activate a Windows
pip install -r requirements.txt
cp .env.example .env
# Edita .env amb DATABASE_URL i OPENAI_API_KEY
uvicorn app.main:app --reload --port 8001


Frontend (Vite)

cd frontend
npm install
cp .env.example .env
# Edita .env amb VITE_API_BASE_URL=http://localhost:8001
npm run dev


📊 5) Mètriques i monitorització

Backend metrics: http://localhost:8000/metrics
Prometheus: http://localhost:9090 (Status → Targets)
Grafana: http://localhost:3000
Dashboards preconfigurats:
OKR Logs Overview (Loki)
FastAPI Performance (OKR API) (Prometheus)

🧹 6) Aturar i netejar
bash
Copy
Edit
docker compose down        # atura
docker compose down -v     # atura i esborra volums (ATENCIÓ: dades)
⚠️ Problemes comuns
Error	Causa	Solució
Port ocupat	Altres serveis usant-lo	Canvia ports: al compose
500 al POST OKR	OPENAI_API_KEY no definit	Afegir-lo a .env del servei API
429 (rate limit)	Massa peticions	Augmentar RATE_LIMIT_MAX_REQUESTS o desactivar Redis
Loki no respon	Configuració o volums	Comprovar loki-config.yml i permisos




## 1 Requisits previs

- **Docker** i **Docker Compose** instal路lats
- Ports necessaris lliures (especialment: 3000 per Grafana, 3306 per MySQL, 6379 per Redis, i el configurat per Loki)
- Fitxers `docker-compose.yml` i `Dockerfile` correctament configurats

---

## 2 Executar l'aplicació

1. **Construir i arrencar serveis**
   ```bash
   docker compose up -d --build
   ```
   O b茅, si vols evitar cache:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

2. **Verificar l'estat dels contenidors**
   ```bash
   docker compose ps
   ```

3. **Accedir als serveis principals**
   - **Frontend (web)**: `http://localhost:<port_web>`
   - **Grafana**: `http://localhost:3000`
   - **Prometheus**: `http://localhost:<port_prometheus>`
   - **API Backend**: `http://localhost:<port_api>`
   - **Redis**: `localhost:6379` (via CLI o aplicaci贸)
   - **Loki**: `http://localhost:<port_loki>`

---

## 3. Debug i verificació

### 1. Veure logs en temps real
```bash
docker compose logs -f <nom_servei>
```
Exemple:
```bash
docker compose logs -f redis
docker compose logs -f loki
```

### 2. Accedir dins d'un contenidor
```bash
docker exec -it <nom_servei> sh
```
Exemple:
```bash
docker exec -it redis sh
```

### 3. Comprovar si un port està escoltant
```bash
docker compose exec <nom_servei> netstat -tulpn
```

### 4. Verificar connectivitat entre serveis
```bash
docker compose exec <nom_servei_origen> ping <nom_servei_desti>
```

---

## 4 Parar i netejar

1. **Parar els serveis**
```bash
docker compose down
```

2. **Parar i eliminar volums (neteja completa)**
```bash
docker compose down -v
```

---

## 5 Notes
- Si un servei no arrenca, comprova si el port est脿 ocupat amb:
```bash
netstat -ano | findstr :<port>
```
- Si Redis o Loki no estan accessibles, comprova que els ports al `docker-compose.yml` estan exposats correctament i que cap altre procés els està utilitzant.
