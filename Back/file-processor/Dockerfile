FROM node:20-alpine

WORKDIR /app

COPY shared/database ../shared/database

COPY shared/database/prisma ./prisma

COPY file-processor/package*.json ./
COPY file-processor/nodemon.json ./

RUN npm ci && \
    npm install -g typescript ts-node nodemon prisma

RUN npx prisma generate

COPY file-processor/src ./src

CMD ["npm", "run", "dev"]