FROM node:24-bookworm

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3333

CMD ["npx", "serverless", "offline", "--host", "0.0.0.0", "--httpPort", "3333"]