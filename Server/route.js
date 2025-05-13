
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
		//ws.WS.All_Add(socket);
	});

	fastify.get('/BrowseUsersTable/:id?', async function (request, reply)
	{
		var id = -1;
		if (request.params.id)
		{
			//id = request.params.id;
		}
		console.log("ID: " + request.params.id);
		reply.code(200);
		reply.header('Content-Type', 'text/html');
		reply.send(user.User.All_Table(id));
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

	fastify.get('/Help/:file', async function (request, reply)
	{
		var rel_path = './Help/';
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

	const node_path = './node_modules/';
	fastify.get('/node_modules/:dir1/:dir2/:file', async function (request, reply)
	{
		var rel_path = node_path
			+ request.params.dir1 + '/'
			+ request.params.dir2 + '/';
		if (request.params.file)
		{
			get_file(reply, rel_path + request.params.file);
		}
		else
		{
			var index_file = 'index';
			index_file += ".js";
			get_file(reply, rel_path + index_file);
		}
	});

	fastify.get('/node_modules/:dir1/:dir2/:dir3/:file', async function (request, reply)
	{
		var rel_path = node_path
			+ request.params.dir1 + '/'
			+ request.params.dir2 + '/'
			+ request.params.dir3 + '/'
		;
		if (request.params.file)
		{
			get_file(reply, rel_path + request.params.file);
		}
		else
		{
			var index_file = 'index';
			index_file += ".js";
			get_file(reply, rel_path + index_file);
		}
	});

	fastify.get('/node_modules/:dir1/:dir2/:dir3/:dir4/:file', async function (request, reply)
	{
		var rel_path = node_path
			+ request.params.dir1 + '/'
			+ request.params.dir2 + '/'
			+ request.params.dir3 + '/'
			+ request.params.dir4 + '/'
		;
		if (request.params.file)
		{
			get_file(reply, rel_path + request.params.file);
		}
		else
		{
			var index_file = 'index';
			index_file += ".js";
			get_file(reply, rel_path + index_file);
		}
	});

	fastify.get('/node_modules/:dir1/:dir2/:dir3/:dir4/:dir5/:file', async function (request, reply)
	{
		var rel_path = node_path
			+ request.params.dir1 + '/'
			+ request.params.dir2 + '/'
			+ request.params.dir3 + '/'
			+ request.params.dir4 + '/'
			+ request.params.dir5 + '/'
		;
		if (request.params.file)
		{
			get_file(reply, rel_path + request.params.file);
		}
		else
		{
			var index_file = 'index';
			index_file += ".js";
			get_file(reply, rel_path + index_file);
		}
	});

	fastify.get('/node_modules/:dir1/:dir2/:dir3/:dir4/:dir5/:dir6/:file', async function (request, reply)
	{
		var rel_path = node_path
			+ request.params.dir1 + '/'
			+ request.params.dir2 + '/'
			+ request.params.dir3 + '/'
			+ request.params.dir4 + '/'
			+ request.params.dir5 + '/'
			+ request.params.dir6 + '/'
		;
		if (request.params.file)
		{
			get_file(reply, rel_path + request.params.file);
		}
		else
		{
			var index_file = 'index';
			index_file += ".js";
			get_file(reply, rel_path + index_file);
		}
	});
}

module.exports = routes;
