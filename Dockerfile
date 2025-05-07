
FROM node:latest
COPY Server Server
COPY Client Client
COPY node_modules node_modules
EXPOSE 5000
CMD ["node", "Server/server.js"]

#docker build --tag node-server .
#docker run node-server
#docker run --publish 5000:5000 node-server
