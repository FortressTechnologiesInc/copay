FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
