FROM docker.io/library/node:23.10.0-alpine3.21 AS builder
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM ghcr.io/nginxinc/nginx-unprivileged:alpine3.21-slim
COPY --from=builder /app/build /app/
COPY ./container/nginx.conf /etc/nginx/nginx.conf
