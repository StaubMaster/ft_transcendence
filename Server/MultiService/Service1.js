import { PortI } from './PortI.js';
import { PortO } from './PortO.js';



const portO = new PortO('localhost', 1000);
portO.request('POST', '/register', { host: 'localhost', port: 2000, path: '/test1' });



const portI = new PortI('localhost', 2000);
portI.fastify.post('/:path', async function (request, reply)
{
	console.log("path'" + request.params.path + "'");
	console.log("body'" + request.body + "'");
	if (request.params.path == "test1")
	{
		reply.code(200);
		reply.send("OK");
	}
	else
	{
		reply.code(500);
		reply.send("Cannot Provide");
	}
});
portI.run();


