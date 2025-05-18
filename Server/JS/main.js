
const fs = require('fs');
const fastify = require('fastify')(
{
	logger: true,
	https: {
		key: fs.readFileSync('./Server/Cert/server.key'),
		cert: fs.readFileSync('./Server/Cert/server.crt')
	}
});
fastify.register(require('@fastify/websocket'));
fastify.register(require('./route.js'));

fastify.listen({ port:5000, host:'0.0.0.0' },
function (err, address)
{
	if (err)
	{
		fastify.log.error("!!!!>" + err + "<!!!!");
		process.exit(1)
	}
});



const autoTicker = require('./AutoTicker.js');
const database = require('./DataBase.js');
