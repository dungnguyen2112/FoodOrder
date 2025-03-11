# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Cài đặt dependencies với --legacy-peer-deps
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]