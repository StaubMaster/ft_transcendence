import http from 'http';



export class PortO
{
	host;
	port;

	constructor(host, port)
	{
		this.host = host;
		this.port = port;
	}

	request(method, path, body)
	{
		if (typeof body === 'object')
		{
			body = JSON.stringify(body);
		}

		const options = {
			host: this.host,
			port: this.port,
			method: method,
			path: path,
		};

		const req = http.request(options, (res) => {
			console.log(".... StatusCode", res.statusCode);

			res.setEncoding('utf-8');

			res.on('data', (chunk) => {
				console.log(".... chunk", chunk);
			});

			res.on('end', () => {
				console.log(".... END");
			});

		});

		req.on('error', (e) => {
			console.log("!!!! error", e);
		});

		//req.setHeader("Content-Type", "application/json");
		req.setHeader("Content-Type", "text/plain");
		req.write(body, (err) => {
			if (err)
			{
				console.log("!!!! err", err);
			}
		});

		req.end();
	}
};


