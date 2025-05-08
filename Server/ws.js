
import * as api from './API_Const.js';
import { User } from './User.js';
import * as database from './DataBase.js';

export class WS
{
	static Temp_ID = 0;

	Temp_ID;
	socket;
	DisConnect;
	User;

	constructor(socket)
	{
		this.ID = User.ID;
		WS.ID++;

		this.socket = socket;
		this.DisConnect = false;
		this.User = null;

		const self_referance = this;
		this.socket.onerror = function(e)
		{
			console.log(self_referance.ID + " socket error: ", e);
		};
		this.socket.onclose = function(e)
		{
			console.log(self_referance.ID + " socket closed:" + e.code + ":" + e.reason);
			self_referance.DisConnect = true;
			WS.All_Remove(self_referance.ID);
		};
		//this.socket.onopen = function() { };
		this.socket.onmessage = function(e)
		{
			self_referance.RecvText(e.data);
		};

		this.SendText(api.WS_Temp_ID + this.ID);
	}

	SendText(text)
	{
		this.socket.send(text);
	}

	RecvText(text)
	{
		//console.log("'" + text + "'");
		if (text.startsWith(api.LOGIN))
		{
			if (this.User != null)
			{
				this.SendText(api.LOGIN + "Already Connected");
				return;
			}

			const value = text.substr(api.LOGIN.length);
			const NamePase = value.split(", ");
			const UserName = NamePase[0];
			const PassWord = NamePase[1];
			//console.log("UserName '" + UserName + "'");
			//console.log("PassWord '" + PassWord + "'");

			const DB_User = database.CheckUser(UserName, PassWord);
			if (typeof DB_User == "string")
			{
				this.SendText(api.LOGIN + DB_User);
				return;
			}

			this.User = User.All_Add(this.socket, DB_User);
			this.SendText(api.LOGIN);
			this.SendText(api.USER_ID + DB_User.id);
			this.SendText(api.USER_Name + DB_User.UserName);
		}
		else if (text.startsWith(api.LOGOUT))
		{
			if (this.User != null)
			{
				User.All_Remove(this.User.ID);
				this.User = null;
			}
			this.SendText(api.LOGOUT);
		}
		else
		{
			//console.log("'" + text + "'");
			if (this.User != null)
			{
				this.User.ParseMessage(text);
			}
		}
	}





	static AllWSArray = [];
	static All_Add(socket)
	{
		console.log("++++ WS ++++");
		this.AllWSArray.push(new WS(socket));
	}
	static All_Remove(id)
	{
		for (var i = 0; i < this.AllWSArray.length; i++)
		{
			if (this.AllWSArray[i].ID == id)
			{
				console.log("---- WS ----");
				this.AllWSArray.splice(i, i + 1);
				i--;
				return;
			}
		}
	}
}
