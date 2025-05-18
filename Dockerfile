
FROM node:latest
COPY Server Server
COPY Client Client
COPY node_modules node_modules
COPY Cert Cert
COPY DataBase DataBase
COPY Help Help
EXPOSE 5000
CMD ["node", "Server/server.js"]

#docker build --tag node-server .
#docker run node-server
#docker run --publish 5000:5000 node-server

#	sort files
#	Client
#	Client/JS
#	Client/TS
#	Server
#	Server/Certs
#	Server/JS
#	Server/DataBase
