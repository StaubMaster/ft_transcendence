
/*
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
*/



//console.log("DATABASE");
//const SQLite = require('node:sqlite');
import * as SQLite from 'node:sqlite';
//const database = new SQLite.DatabaseSync(':memory:');
const database = new SQLite.DatabaseSync('DataBase');

database.exec(`
	CREATE TABLE IF NOT EXISTS user(
		id INTEGER PRIMARY KEY,
		UserName TEXT,
		PassWord TEXT
	) STRICT
`);



console.log("check:", CheckUser("fe", "323"));
console.log("check:", CheckUser("asd", "323"));
console.log("check:", CheckUser("asd", "123"));
export function CheckUser(userName, passWord)
{
	const query = database.prepare("SELECT * FROM user WHERE UserName='" + userName + "'");
	const users = query.all();
	if (users.length == 0)
	{
		return "UserName not found";
	}
	if (users.length != 1)
	{
		return "UserName exists multiple times";
	}
	if (users[0].PassWord != passWord)
	{
		return "Wrong PassWord";
	}
	return users[0];
}



console.log("inser:", InsertUser('asd', '123'));
export function InsertUser(userName, passWord)
{
	const query = database.prepare("SELECT * FROM user WHERE UserName='" + userName + "'");
	if (query.all().length != 0)
	{
		return "UserName already in use";
	}

	const insert = database.prepare('INSERT INTO user (UserName, PassWord) VALUES (?, ?)');
	insert.run(userName, passWord);
}



const query = database.prepare("SELECT * FROM user ORDER BY id");
//const query = database.prepare("SELECT id, UserName FROM user ORDER BY id");
console.log(query.all());
