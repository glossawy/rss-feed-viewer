FROM oven/bun:1.1-alpine as builder

COPY ./src /app/src
COPY ./public /app/public
COPY bunfig.toml bun.lockb yarn.lock happy.ts mocking.ts vite.config.ts \
  tsconfig.json tsconfig.node.json package.json index.html /app/

WORKDIR /app

RUN bun install --frozen-lockfile && bun run build

COPY ./proxy /app/proxy
WORKDIR /app/proxy
RUN bun install --frozen-lockfile

FROM oven/bun:1.1-alpine as proxy

RUN addgroup -g 101 -S rssviewer && \
  adduser -u 101 -H -D -S -G rssviewer rssviewer

COPY ./proxy /app
COPY --from=builder /app/proxy/node_modules /app/node_modules

USER rssviewer

CMD exec bun run /app/src/index.ts --no-install

FROM caddy:2-alpine as viewer

EXPOSE 80

RUN mkdir -p /var/www/app && \
  addgroup -g 101 -S caddy && \
  adduser -u 101 -H -D -S -G caddy caddy && \
  chown -R caddy:caddy /config /data

COPY --from=builder /app/dist /var/www/app/html

USER caddy

COPY ./caddyfiles/Caddyfile.prod /etc/caddy/Caddyfile
