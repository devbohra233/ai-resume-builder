# ---- Build the React client ----
FROM node:22-bookworm-slim AS client-build
WORKDIR /app
COPY client/package.json client/package-lock.json client/
RUN npm ci --prefix client
COPY client client
RUN npm --prefix client run build

# ---- Runtime: Express API + static client ----
FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY server/package.json server/package-lock.json server/
RUN npm ci --prefix server --omit=dev
COPY server/src server/src
COPY --from=client-build /app/client/dist client/dist
RUN mkdir -p server/uploads server/.data
EXPOSE 5000
CMD ["node", "server/src/index.js"]
