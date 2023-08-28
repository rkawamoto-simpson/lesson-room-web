FROM nginx:1.17.1-alpine

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./source /usr/share/nginx/html

EXPOSE 8002