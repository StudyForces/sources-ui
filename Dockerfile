FROM node:alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app/
RUN mkdir node_modules/latex.js/dist/packages node_modules/latex.js/dist/documentclasses
RUN npm run build

FROM nginx:1.21.4
COPY --from=build /app/build /etc/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
