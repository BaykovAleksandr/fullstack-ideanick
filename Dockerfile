FROM node:20.19.0-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# 1. Копируем ВСЕ файлы управления зависимостями
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY webapp/package.json ./webapp/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# 2. СНАЧАЛА устанавливаем зависимости (включая workspace)
# Используем --recursive для установки всех подпроектов
RUN pnpm fetch --prod
RUN pnpm install --offline --frozen-lockfile --recursive

# 3. Копируем ВСЕ исходные коды
COPY shared ./shared
COPY webapp ./webapp
COPY backend ./backend

ARG NODE_ENV=production
ARG SOURCE_VERSION

# 4. Сборка (теперь зависимости всех подпроектов установлены)
RUN pnpm b prepare  # -> запустит ts-patch и prisma generate
RUN pnpm b build    # -> соберёт бэкенд
RUN pnpm w build    # -> соберёт фронтенд


FROM node:20.19.0-alpine AS runner

WORKDIR /app

# 5. Копируем только production-артефакты
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/webapp/package.json ./webapp/
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/shared/package.json ./shared/

# 6. Копируем результаты сборки (только дистрибутивы)
COPY --from=builder /app/webapp/dist ./webapp/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/prisma ./backend/src/prisma

# 7. Устанавливаем ТОЛЬКО production-зависимости для запуска
RUN npm install -g pnpm
# Устанавливаем зависимости только для продакшена, рекурсивно
RUN pnpm install --prod --frozen-lockfile --recursive

# 8. Генерируем Prisma клиент (нужен schema.prisma)
RUN pnpm b pgc

ARG SOURCE_VERSION
ENV SOURCE_VERSION=$SOURCE_VERSION

# 9. Запускаем миграции и стартуем сервер
CMD pnpm b pmp && pnpm b start