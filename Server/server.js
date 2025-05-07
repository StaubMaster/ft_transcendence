
//import * as sesPong from './Session/SesPong.js';
//const sesPong = require('./Session/SesPong.js');
//import { SessionPong } from './Session/SesPong.js';
const sesPong = require('./Session/SesPong.js');
setInterval(ticker, 10);

const fastify = require('fastify')(
{
	logger: true
})
fastify.register(require('@fastify/websocket'))
fastify.register(require('./route.js'))

//	use ipconfig to get local IP
//	e.g.:	192.168.0.208
fastify.listen({ port:5000, host:'0.0.0.0' },
function (err, address)
{
	if (err)
	{
		fastify.log.error("!!!!>" + err + "<!!!!");
		process.exit(1)
	}
})

function ticker()
{
	//sesPong.AllSesPongs_Update();
	sesPong.SessionPong.All_Update();
}
