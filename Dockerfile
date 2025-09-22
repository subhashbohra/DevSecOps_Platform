FROM node:10-alpine
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
