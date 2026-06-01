FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_APP_ENV=production
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

RUN npx prisma generate
RUN npx prisma db push --skip-generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]


