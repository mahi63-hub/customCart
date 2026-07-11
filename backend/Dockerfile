FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
COPY routes ./routes

EXPOSE 3000

CMD ["npm", "start"]
