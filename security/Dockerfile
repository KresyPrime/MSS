FROM node:22-trixie-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY openapi.yaml ./

EXPOSE 9002

CMD ["npm", "start"]
