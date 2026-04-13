FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY . .
RUN bun run build

FROM base AS release
COPY --from=build /app/dist dist
COPY --from=build /app/public public

EXPOSE 3001
ENTRYPOINT ["bun", "dist/server.js"]