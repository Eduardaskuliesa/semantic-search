FROM node:20-alpine

WORKDIR /app

COPY shared/database ../shared/database

COPY shared/database/prisma ./prisma

COPY database-api/package*.json ./
COPY database-api/nodemon.json ./
COPY database-api/tsconfig.json ./

RUN npm ci && \
    npm install -g typescript ts-node nodemon prisma

RUN npx prisma generate

COPY database-api/src ./src

EXPOSE 4040

CMD ["npm", "run", "dev"]