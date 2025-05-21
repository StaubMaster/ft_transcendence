import Fastify from 'fastify';



export class PortI
{
	fastify;

	host;
	port;

	constructor(host, port)
	{
		this.fastify = Fastify({
			//logger: true,
		});

		this.host = host;
		this.port = port;
	}

	run()
	{
		const options = {
			host: this.host,
			port: this.port,
		};

		this.fastify.listen(options, (err, address) => {
			if (err)
			{
				console.log("error", err);
				process.exit(1);
			}
		});
	}
};


