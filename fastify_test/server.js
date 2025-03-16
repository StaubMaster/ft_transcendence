
const fastify = require('fastify')(
{
	logger: true
})
fastify.register(require('@fastify/websocket'))
fastify.register(require('./route'))

fastify.listen({ port:5000 }, function (err, address)
{
	if (err)
	{
		fastify.log.error("!!!!>" + err + "<!!!!");
		process.exit(1)
	}
})
