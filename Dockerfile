FROM node:22-slim
WORKDIR /app
COPY server/package*.json server/
RUN cd server && npm ci --omit=dev
COPY server/src server/src
COPY public public
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
EXPOSE 3000
USER node
CMD ["node", "server/src/server.js"]
