
const user = require('./User.js');
const fs = require('fs');

function get_file(reply, file_path)
{
	if (fs.existsSync(file_path))
	{
		reply.code(200);

		var type = null;
		if (file_path.endsWith(".html")) { type = 'text/html'; }
		if (file_path.endsWith(".css")) { type = 'text/css'; }
		if (file_path.endsWith(".js")) { type = 'text/javascript'; }
		if (type) { reply.header('Content-Type', type); }

		var text = fs.readFileSync(file_path, 'utf-8');
		reply.send(text);
	}
	else
	{
		reply.code(404);
	}
}

async function routes(fastify, options)
{
	fastify.get('/wss', { websocket: true }, async function (socket, request)
	{
		user.User.All_Add(socket);
	});

	fastify.get('/:file', async function (request, reply)
	{
		var rel_path = './Client/';
		if (request.params.file)
		{
			get_file(reply, rel_path + request.params.file);
		}
		else
		{
			var index_file = 'index';
			index_file += ".html";
			get_file(reply, rel_path + index_file);
		}
	});

	fastify.get('/JS/:file', async function (request, reply)
	{
		var rel_path = './Client/JS/';
		if (request.params.file)
		{
			get_file(reply, rel_path + request.params.file);
		}
		else
		{
			var index_file = 'index';
			index_file += ".html";
			get_file(reply, rel_path + index_file);
		}
	});

	fastify.get('/node_modules/*', async function (request, reply)
	{
		if (!request.url.endsWith("/"))
		{
			get_file(reply, "." + request.url);
		}
		else
		{
			get_file(reply, "." + request.url + "index.js");
		}
	});
}

module.exports = routes;
