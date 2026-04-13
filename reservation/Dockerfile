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
COPY --from=build /app/src src
COPY --from=build /app/dist dist
COPY --from=build /app/public public
COPY --from=build /app/package.json package.json
COPY --from=build /app/drizzle drizzle
COPY --from=build /app/drizzle.config.ts drizzle.config.ts

EXPOSE 3001
ENTRYPOINT ["bun", "run", "docker-start"]