import { PortI } from './PortI.js';
import { PortO } from './PortO.js';



/*	how2run
node start Broker
node start Services
node start Host
*/

/*	what do

other services dont import Broker
but contact through localhost:1000


1 in port
1 out port for each registered service

each service has 1 out port and an array of provided things it can to

when a service registers something
{
	check if that service is already registered
	if yes
	{
		add provided thing to services list
	}
	else
	{
		add service to list
		add provided thing to services list
	}
}

Problem:
a service can directly do something
or do something with parameters
Solution:
Broker can forward 0 to n parameters, if more are given it return an error
no wait, that is uri parameters
just only provide parameters in the body



Problem:
how to make sure no Service asks for something
from another Service thats not registered jet
Solution:
my itself the Server dosent do anything
until a User connects or something
so just hope that dosent happen before the Server is ready

*/



class ServiceProvider
{
	host;
	port;

	portO;
	paths;

	constructor(host, port)
	{
		this.host = host;
		this.port = port;
		this.portO = new PortO(host, port);
		this.paths = [];
	}

	CheckHostPort(host, port)
	{
		return (this.host == host && this.port == port);
	}
	checkPath(path)
	{
		for (let i = 0; i < this.paths.length; i++)
		{
			if (this.paths[i] == path)
			{
				return true;
			}
		}
		return false;
	}

	register(path)
	{
		const i = this.paths.push(path);
	}
};

var providers = [];
function FindProvider(host, port)
{
	for (let i = 0; i < providers.length; i++)
	{
		if (providers[i].CheckHostPort(host, port))
		{
			return providers[i];
		}
	}
	return null;
}
function FindRegisteredPath(path)
{
	for (let i = 0; i < providers.length; i++)
	{
		if (providers[i].checkPath(path))
		{
			return providers[i];
		}
	}
	return null;
}

function register(host, port, path)
{
	let prov;

	prov = FindRegisteredPath(path);
	if (prov)
	{
		return "Path already registered";
	}

	prov = FindProvider(host, port);
	if (!prov)
	{
		prov = new ServiceProvider(host, port);
		providers.push(prov);
	}
	prov.register(path);
}
function RelayPost(path, body)
{
	let prov = FindRegisteredPath(path);
	if (prov)
	{
		prov.portO.request('POST', path, body);
		return;
	}
	else
	{
		return "Path not registered";
	}
}



const portI = new PortI('localhost', 1000);

portI.fastify.post('/register', async function (request, reply)
{
	const data = JSON.parse(request.body);
	const ret = register(data.host, data.port, data.path);

	if (typeof ret === 'string')
	{
		reply.code(500);
		reply.send(ret);
	}
	else
	{
		reply.code(200);
		reply.send("Registration successfull");
	}
});

portI.fastify.post('/:path', async function (request, reply)
{
	const ret = RelayPost("/" + request.params.path, request.body);
	if (typeof ret === 'string')
	{
		reply.code(500);
		reply.send(ret);
	}
	else
	{
		reply.code(200);
		reply.send("Forward successfull");
	}
});

portI.run();


