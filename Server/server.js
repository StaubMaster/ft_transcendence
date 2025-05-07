
const sesPong = require('./Session/SesPong.js');
setInterval(function ()
{
	sesPong.SessionPong.All_Update();
}, 1);



const fastify = require('fastify')(
{
	logger: true
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



console.log("DATABASE");
const SQLite = require('node:sqlite');
const database = new SQLite.DatabaseSync(':memory:');

database.exec(`
  CREATE TABLE data(
    key INTEGER PRIMARY KEY,
    value TEXT
  ) STRICT
`);
const insert = database.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
insert.run(1, 'hello');
insert.run(2, 'world');

const query = database.prepare('SELECT * FROM data ORDER BY key');
console.log(query.all());
