import { PortI } from './PortI.js';
import { PortO } from './PortO.js';



const portI = new PortI('localhost', 2000);
const portO = new PortO('localhost', 1000);

portO.request('POST', '/register', { host: portI.host, port: portI.port, path: '/test1' });

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


