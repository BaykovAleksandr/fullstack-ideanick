FROM node:20.19.0-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# 1. Копируем файлы управления зависимостями
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY webapp/package.json ./webapp/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# 2. Устанавливаем зависимости
RUN pnpm fetch
RUN pnpm install --offline --ignore-scripts --frozen-lockfile

# 3. Копируем ВСЕ исходные коды для сборки
COPY shared ./shared
COPY webapp ./webapp
COPY backend ./backend

ARG NODE_ENV=production
ARG SOURCE_VERSION

# 4. Сборка (теперь все файлы на месте)
RUN pnpm b prepare
RUN pnpm b build
RUN pnpm w build


FROM node:20.19.0-alpine AS runner

WORKDIR /app

# 5. Копируем только необходимые артефакты
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/webapp/package.json ./webapp/
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/shared/package.json ./shared/

# 6. Копируем результаты сборки
COPY --from=builder /app/webapp/dist ./webapp/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/prisma ./backend/src/prisma

# 7. Устанавливаем только production-зависимости
RUN npm install -g pnpm
RUN pnpm install --ignore-scripts --frozen-lockfile --prod

RUN pnpm b pgc

ARG SOURCE_VERSION
ENV SOURCE_VERSION=$SOURCE_VERSION

CMD pnpm b pmp && pnpm b start