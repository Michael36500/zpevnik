FROM ghcr.io/nginxinc/nginx-unprivileged:alpine3.21-slim

WORKDIR /app

COPY ./container/nginx.conf /app/
COPY build .

CMD nginx -g 'daemon off;' -c /app/nginx.conf
