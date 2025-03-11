
const fs = require('fs');

async function routes(fastify, options)
{
	fastify.get('/', async function (request, reply)
	{
		reply.code(200);
		reply.header('Content-Type', 'text/html');

		var text = fs.readFileSync('index.html', 'utf-8');
		//console.log(text);
		return text;
	})
}

module.exports = routes;
