FROM node:alpine

WORKDIR /app

COPY package*.json ./
COPY nodemon.json ./
COPY tsconfig.json ./

RUN npm ci && \
    npm install -g typescript ts-node nodemon


COPY . .

EXPOSE 4040

CMD ["npm", "run", "dev"]