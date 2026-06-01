FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build ke time APP_ENV set karo
ARG NEXT_PUBLIC_APP_ENV=production
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]