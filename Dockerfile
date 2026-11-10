# 1) Construction du site Next.js (export statique dans web/out)
FROM node:22-slim AS web
WORKDIR /web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# 2) Serveur Express : API + pages statiques
FROM node:22-slim
WORKDIR /app
COPY server/package*.json server/
RUN cd server && npm ci --omit=dev
COPY server/src server/src
COPY --from=web /web/out web/out
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
EXPOSE 3000
USER node
CMD ["node", "server/src/server.js"]
