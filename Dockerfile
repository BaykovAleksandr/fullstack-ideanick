FROM node:20.19.0-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# 1. Копируем ВСЕ файлы управления зависимостями
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY webapp/package.json ./webapp/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# 2. Устанавливаем переменную CI для pnpm
ENV CI=true

# 3. ТОЛЬКО fetch (без install!), чтобы подготовить пакеты
RUN pnpm fetch --prod

# 4. Копируем ВСЕ исходные коды (включая schema.prisma!)
COPY shared ./shared
COPY webapp ./webapp
COPY backend ./backend

# 5. ТЕПЕРЬ устанавливаем зависимости (prepare найдет schema.prisma)
RUN pnpm install --frozen-lockfile --fix-lockfile

ARG NODE_ENV=production
ARG SOURCE_VERSION

# 6. Проверка структуры перед сборкой фронтенда
RUN find /app/webapp/src -name "*Layout*" -type f

# 7. Сборка
RUN pnpm b build    # -> соберёт бэкенд

# В секции builder перед сборкой фронтенда добавьте:
ARG VITE_BACKEND_TRPC_URL
ARG VITE_WEBAPP_URL
ARG VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_BACKEND_TRPC_URL=$VITE_BACKEND_TRPC_URL
ENV VITE_WEBAPP_URL=$VITE_WEBAPP_URL
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV NODE_ENV=production

# Затем сборка фронтенда

RUN pnpm w build    # -> соберёт фронтенд


FROM node:20.19.0-alpine AS runner

WORKDIR /app

ENV CI=true

# 8. Копируем только production-артефакты
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/webapp/package.json ./webapp/
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/shared/package.json ./shared/

# 9. Копируем результаты сборки (только дистрибутивы)
COPY --from=builder /app/webapp/dist ./webapp/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/prisma ./backend/src/prisma

# 10. Устанавливаем ТОЛЬКО production-зависимости для запуска
RUN npm install -g pnpm
# Устанавливаем зависимости для продакшена (prepare НЕ запустится из-за --prod)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 11. Генерируем Prisma клиент (нужен schema.prisma)
# Нужно убедиться, что prisma schema на месте
RUN cd backend && npx prisma generate

ARG SOURCE_VERSION
ENV SOURCE_VERSION=$SOURCE_VERSION

# 12. Запускаем миграции и стартуем сервер
CMD pnpm b pmp && pnpm b start