FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./
COPY public ./public
COPY shrimps ./shrimps

EXPOSE 3000

CMD ["npm", "start"]
