FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
# Build-time env vars (NEXT_PUBLIC_* get baked into the bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_WHATSAPP=573000000000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WHATSAPP=$NEXT_PUBLIC_WHATSAPP
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --workspace=packages/types --workspace=apps/web
COPY packages/types ./packages/types
COPY apps/web ./apps/web
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/web

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["/app/node_modules/.bin/next", "start"]
