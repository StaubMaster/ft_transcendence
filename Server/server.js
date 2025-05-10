
const fastify = require('fastify')(
{
	logger: true,
	/*https: {
		key: fs.readFileSync('./key.pem'),
	}*/
});
fastify.register(require('@fastify/websocket'));
fastify.register(require('./route.js'));

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
});



const autoTicker = require('./AutoTicker.js');
/*const sesPong = require('./Session/SesPong.js');
setInterval(function ()
{
	sesPong.SessionPong.All_Update();
}, 1);*/



const database = require('./DataBase.js');
