FROM node:24-bookworm

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate

RUN yarn build

EXPOSE 3333

CMD ["yarn", "serverless", "offline", "--host", "0.0.0.0", "--httpPort", "3333"]