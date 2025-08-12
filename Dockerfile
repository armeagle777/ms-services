FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY ./src/API/Certificates/migration-request.pem ./src/API/Certificates/migration-request.pem
RUN npm install --production=false
COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY ./src/API/Certificates/migration-request.pem ./src/API/Certificates/migration-request.pem
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
