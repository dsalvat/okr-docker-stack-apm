# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
# RUN npm ci
COPY . .
# ensure prod API path is /api to hit the nginx proxy (no CORS)
RUN echo "VITE_API_BASE_URL=/api" > .env.production
RUN npm run build

# Run stage (nginx)
FROM nginx:1.27-alpine
# proxy /api to backend service 'api' (FastAPI) on port 8000
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
