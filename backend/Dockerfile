FROM node:20-alpine AS build

WORKDIR /app/backend

RUN apk add --no-cache openssl

COPY backend/package*.json ./
RUN npm install

COPY backend ./
RUN npm run prisma:generate && npm run build

FROM node:20-alpine AS runtime

WORKDIR /app/backend

RUN apk add --no-cache openssl

COPY --from=build /app/backend /app/backend

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && (npx prisma db seed || true) && npm run start"]