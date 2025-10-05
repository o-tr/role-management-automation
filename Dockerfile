FROM node:22-alpine AS base
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build phase
FROM base AS builder

WORKDIR /app
RUN corepack enable pnpm

RUN --mount=type=bind,readonly,source=./package.json,target=./package.json \
    --mount=type=bind,readonly,source=./pnpm-lock.yaml,target=./pnpm-lock.yaml \
    CI=true pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN BUILD_STANDALONE=1 pnpm run build


FROM base AS prisma

WORKDIR /prisma
RUN corepack enable pnpm
RUN --mount=type=bind,readonly,source=./package.json,target=./origin-package.json \
    node -e "const fs = require('fs'); \
           const originPackage = JSON.parse(fs.readFileSync('./origin-package.json').toString()); \
           const prismaVersion = originPackage.dependencies.prisma; \
           fs.writeFileSync('./package.json', JSON.stringify({ \
             dependencies: { prisma: prismaVersion } \
           }, null, 2));"
RUN npm install --production

# Run phase
FROM base AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=prisma --chown=nodejs:nodejs /prisma/node_modules /prisma/node_modules

COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

COPY ./docker/.env.placeholder ./.env
COPY ./docker/env-replacer.sh ./
COPY ./start.sh ./

RUN chmod +x ./env-replacer.sh && \
    chmod +x ./start.sh && \
    mv .env .env.replacer

# Create a non-root user to run the application
RUN adduser -D nodejs
USER nodejs

ENTRYPOINT [ "/app/env-replacer.sh" ]

# Copy artifacts
CMD ["./start.sh"]
