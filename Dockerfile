
FROM node:latest
COPY node_modules node_modules
COPY Server Server
COPY Client Client
EXPOSE 5000
CMD ["node", "Server/JS/main.js"]

#docker build --tag node-server .
#docker run node-server
#docker run --publish 5000:5000 node-server
