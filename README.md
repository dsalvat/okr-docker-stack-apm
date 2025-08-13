# Guia d'Execució i Debug de l'Stack OKR

Aquesta guia explica com arrencar, parar i debugar l'stack OKR que utilitza Docker Compose, aix铆 com verificar l'estat dels serveis.

---

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
