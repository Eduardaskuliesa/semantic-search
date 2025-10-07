FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci && \
    npm install -g typescript ts-node nodemon

COPY nodemon.json ./
COPY . .

CMD ["npm", "run", "dev"]