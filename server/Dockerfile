FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    vips-dev

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && \
    cp -R node_modules prod_node_modules && \
    npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

COPY --from=builder --chown=nodeapp:nodejs /app/dist ./dist
COPY --from=deps --chown=nodeapp:nodejs /app/prod_node_modules ./node_modules
COPY --chown=nodeapp:nodejs package*.json ./

USER nodeapp

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]
