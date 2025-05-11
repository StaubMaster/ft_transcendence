
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
		this.Temp_ID = WS.Temp_ID;
		WS.Temp_ID++;

		this.socket = socket;
		this.DisConnect = false;
		this.User = null;

		const self_referance = this;
		this.socket.onerror = function(e)
		{
			console.log(self_referance.Temp_ID + " socket error: ", e);
		};
		this.socket.onclose = function(e)
		{
			console.log(self_referance.Temp_ID + " socket closed:" + e.code + ":" + e.reason);
			self_referance.DisConnect = true;
			WS.All_Remove(self_referance.Temp_ID);
			self_referance.UserRemove();
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
			const NamePass = value.split(", ");
			const UserName = NamePass[0];
			const PassWord = NamePass[1];
			//console.log("UserName '" + UserName + "'");
			//console.log("PassWord '" + PassWord + "'");

			const DB_User = database.CheckUser(UserName, PassWord);
			if (typeof DB_User == "string")
			{
				this.SendText(api.LOG_INFO + DB_User);
				return;
			}
			this.User = User.All_Add(this.socket, DB_User);

			this.SendText(api.LOG_INFO);
			this.SendText(api.USER_ID + DB_User.id);
			this.SendText(api.USER_Name + DB_User.UserName);
		}
		else if (text.startsWith(api.LOGOUT))
		{
			this.UserRemove();
			this.SendText(api.LOGOUT);
		}
		else if (text.startsWith(api.REGISTER))
		{
			const value = text.substr(api.REGISTER.length);
			const NamePass = value.split(", ");
			const UserName = NamePass[0];
			const PassWord = NamePass[1];
			console.log("UserName '" + UserName + "'");
			console.log("PassWord '" + PassWord + "'");

			const ret = database.InsertUser(UserName, PassWord);
			if (ret !== undefined)
			{
				this.SendText(api.LOG_INFO + ret);
				return;
			}

			const DB_User = database.CheckUser(UserName, PassWord);
			if (typeof DB_User == "string")
			{
				this.SendText(api.LOG_INFO + DB_User);
				return;
			}
			this.User = User.All_Add(this.socket, DB_User);

			this.SendText(api.LOG_INFO);
			this.SendText(api.USER_ID + DB_User.id);
			this.SendText(api.USER_Name + DB_User.UserName);
		}
		else if (text.startsWith(api.DELETE_ME))
		{
			if (this.User != null)
			{
				database.RemoveUser(this.User.DB_User.UserName, this.User.DB_User.PassWord);
			}
			this.UserRemove();
			this.SendText(api.DELETE_ME);
		}
		else if (text.startsWith(api.USER_DATA_SEARCH_ID))
		{
			const value = text.substr(api.USER_DATA_SEARCH_ID.length);
			this.SendText(api.USER_DATA + WS.SearchUserData(value));
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

	UserRemove()
	{
		if (this.User != null)
		{
			User.All_Remove(this.User.DB_User.id);
			this.User = null;
		}
	}





	static SearchUserData(id)
	{
		const DB_User = database.FindUser(id);
		if (DB_User === undefined)
		{
			return "";
		}
		else
		{
			const All_User = User.All_GetByID(id);
			var str = '{';
			str += '"ID":' + DB_User.id + ',';
			str += '"Name":"' + DB_User.UserName + '",';
			str += '"Status":"';
			if (All_User == null)
			{
				str += "offline";
			}
			else
			{
				str += All_User.Status;
			}
			str += '"';
			str += '}';
			return str;
		}
	}





	static AllWSArray = [];
	static All_Add(socket)
	{
		console.log("++++ WS", this.Temp_ID);
		this.AllWSArray.push(new WS(socket));
	}
	static All_Remove(id)
	{
		for (var i = 0; i < this.AllWSArray.length; i++)
		{
			if (this.AllWSArray[i].Temp_ID == id)
			{
				console.log("---- WS", this.Temp_ID);
				this.AllWSArray.splice(i, i + 1);
				i--;
				return;
			}
		}
	}
	static All_Send(text)
	{
		for (var i = 0; i < this.AllWSArray.length; i++)
		{
			this.AllWSArray[i].SendText(text);
		}
	}
}
