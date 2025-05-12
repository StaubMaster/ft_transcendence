import * as SQLite from 'node:sqlite';
import { sha256 } from '../Help/SHA256.js';

const database = new SQLite.DatabaseSync('DataBase');
database.exec(`
	CREATE TABLE IF NOT EXISTS user(
		id INTEGER PRIMARY KEY,
		UserName TEXT,
		PassWord TEXT
	) STRICT
`);



export function CheckUser(userName, passWord)
{
	passWord = sha256(passWord);

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

export function InsertUser(userName, passWord)
{
	passWord = sha256(passWord);

	const query = database.prepare("SELECT * FROM user WHERE UserName='" + userName + "'");
	if (query.all().length != 0)
	{
		return "UserName already in use";
	}

	const insert = database.prepare('INSERT INTO user (UserName, PassWord) VALUES (?, ?)');
	insert.run(userName, passWord);
	console.log("++++ DataBase User '" + userName + "' '" + passWord + "'");
}

export function RemoveUser(userName, passWord)
{
	const remove = database.prepare("DELETE FROM user WHERE UserName='" + userName + "' AND PassWord='" + passWord + "'");
	remove.run();
	console.log("---- DataBase User '" + userName + "' '" + passWord + "'");
}

export function FindUser(id)
{
	const query = database.prepare("SELECT * FROM user WHERE id=" + id);
	const users = query.all();
	if (users.length == 1)
	{
		return users[0];
	}
	return;
}


const query = database.prepare("SELECT * FROM user ORDER BY id");
console.log(query.all());

