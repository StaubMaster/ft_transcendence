import * as api from '../Help/API_Const.js';
import * as database from './DataBase.js';
import { SessionPong } from './Session/SesPong.js';



export class User
{
	Temp_ID;

	IsConnected;
	IsLoggedIn;
	IsActive;

	socket;

	DB_User;
	InvitedUser;
	InvitesList;

	PressUP;
	PressDW;

	Status;

	constructor(temp_id, socket)
	{
		this.Temp_ID = temp_id;

		this.IsConnected = true;
		this.IsLoggedIn = false;
		this.IsActive = false;

		this.socket = socket;

		this.DB_User = null;
		this.InvitedUser = null;
		this.InvitesList = null;

		this.PressUP = false;
		this.PressDW = false;

		this.Status = 0;

		const self_referance = this;
		this.socket.onerror = function(e)
		{
			console.log(self_referance.Temp_ID + " socket error: ", e);
		};
		this.socket.onclose = function(e)
		{
			console.log(self_referance.Temp_ID + " socket closed:" + e.code + ":" + e.reason);
			self_referance.IsConnected = false;
			User.All_Remove(self_referance.Temp_ID);
		};
		//this.socket.onopen = function() { };
		this.socket.onmessage = function(e)
		{
			self_referance.RecvText(e.data);
		};
	}



	SendText(text)
	{
		if (this.IsConnected)
		{
			this.socket.send(text);
		}
	}
	RecvText(text)
	{
		if (text.startsWith(api.USER_DATA_SEARCH_ID))
		{
			const value = text.substr(api.USER_DATA_SEARCH_ID.length);
			this.SendText(api.USER_DATA + User.All_SearchUserData(value));
		}
		else if (text.startsWith(api.SEARCH_SESSIONS_LIST_USER_ID))
		{
			const value = text.substr(api.SEARCH_SESSIONS_LIST_USER_ID.length);
			this.SendText(api.SEARCH_SESSIONS_LIST_DATA + SessionPong.All_SearchByUserID(value));
		}
		else if (text.startsWith(api.LOGIN))
		{
			const value = text.substr(api.LOGIN.length);
			const NamePass = value.split(", ");
			this.AccountLogIn(NamePass[0], NamePass[1]);
		}
		else if (text.startsWith(api.LOGOUT))
		{
			this.AccountLogOut();
		}
		else if (text.startsWith(api.REGISTER))
		{
			const value = text.substr(api.REGISTER.length);
			const NamePass = value.split(", ");
			this.AccountRegister(NamePass[0], NamePass[1]);
		}
		else if (text.startsWith(api.DELETE_ME))
		{
			this.AccountDeleteMe();
		}
		else if (text.startsWith(api.INVITE_Request_ID))
		{
			const value = text.substr(api.INVITE_Request_ID.length);
			if (this.InvitedUser != null)
			{
				this.InvitedUser.InvitesList_Remove(this);
			}
			this.InvitedUser = User.All_GetByID(value);
			if (this.InvitedUser != null)
			{
				this.InvitedUser.InvitesList_Add(this);
			}
		}
		else if (text.startsWith(api.INVITE_Accept_ID))
		{
			const value = text.substr(api.INVITE_Accept_ID.length);
			var user = this.InvitesList_Find(value);
			if (user != null)
			{
				SessionPong.All_Add(this, user);
			}
		}
		else if (text.startsWith(api.API_USER_SESSION))
		{
			this.IsActive = true;
			const value = text.substr(api.API_USER_SESSION.length);
			if      (value == "UP") { this.PressUP = true; }
			else if (value == "DW") { this.PressDW = true; }
			else if (value == "!UP") { this.PressUP = false; }
			else if (value == "!DW") { this.PressDW = false; }
			else
			{
				console.log("Unknown Session Input '" + value + "'");
			}
		}
		else
		{
			console.log("Unidentified Message: '" + text + "'");
		}
	}



	CheckIsHere()
	{
		return (this.IsConnected && this.IsLoggedIn);
	}



	AccountLogIn(UserName, PassWord)
	{
		if (this.IsLoggedIn)
		{
			this.SendText(api.LOG_INFO + "Already Logged In");
			return;
		}
		const DB_User = database.CheckUser(UserName, PassWord);
		if (typeof DB_User == "string")
		{
			this.SendText(api.LOG_INFO + DB_User);
			return;
		}
		this.SendText(api.LOGIN);
		this.SendText(api.USER_ID + DB_User.id);
		this.SendText(api.USER_Name + DB_User.UserName);

		this.DB_User = DB_User;
		this.InvitedUser = null;
		this.InvitesList = [];
		this.IsLoggedIn = true;
		console.log("User", this.Temp_ID, "logged in");
	}
	AccountLogOut()
	{
		if (!this.IsLoggedIn)
		{
			this.SendText(api.LOG_INFO + "Not Logged In");
			return;
		}
		this.SendText(api.LOGOUT);

		this.DB_User = null;
		this.InvitedUser = null;
		this.InvitesList = null;
		this.IsLoggedIn = false;
		console.log("User", this.Temp_ID, "logged out");
	}
	AccountRegister(UserName, PassWord)
	{
		if (this.IsLoggedIn)
		{
			this.SendText(api.LOG_INFO + "Already Logged In");
			return;
		}
		const ret = database.InsertUser(UserName, PassWord);
		if (ret !== undefined)
		{
			this.SendText(api.LOG_INFO + ret);
			return;
		}
		this.AccountLogIn(UserName, PassWord);
	}
	AccountDeleteMe()
	{
		if (!this.IsLoggedIn)
		{
			this.SendText(api.LOG_INFO + "Not Logged In");
			return;
		}
		database.RemoveUser(this.DB_User.UserName, this.DB_User.PassWord);
		this.AccountLogOut();
	}



	InvitesList_Add(user)
	{
		console.log("++++ Invite", this.DB_User.id, user.DB_User.id);
		this.InvitesList.push(user);
	}
	InvitesList_Remove(user)
	{
		for (var i = 0; i < this.InvitesList.length; i++)
		{
			if (this.InvitesList[i].DB_User.id == user.DB_User.id)
			{
				console.log("---- Invite", this.DB_User.id, user.DB_User.id);
				this.InvitesList.splice(i, i + 1);
				return;
			}
		}
	}
	InvitesList_Find(id)
	{
		for (var i = 0; i < this.InvitesList.length; i++)
		{
			if (this.InvitesList[i].DB_User.id == id)
			{
				return this.InvitesList[i];
			}
		}
		return null;
	}
	InvitesList_Table()
	{
		var table = '[';
		for (var i = 0; i < this.InvitesList.length; i++)
		{
			if (i != 0) { table += ','; }
			table += this.InvitesList[i].ToTableJSON(-1);
		}
		return table + ']';
	}



	ToJSON()
	{
		this.Status++;
		var str = '{';
		str += '"ID":' + this.DB_User.id + ',';
		str += '"User":"' + this.DB_User.UserName + '",';
		str += '"Status":"';
		str += this.Status;
		str += '"';
		return str + '}';
	}
	ToTableJSON()
	{
		this.Status++;
		var str = '{';
		str += '"ID":' + this.DB_User.id + ',';
		str += '"User":"' + this.DB_User.UserName + '",';
		str += '"Status":"';
		str += this.Status;
		str += '"';
		return str + '}';
	}





	static Temp_ID = 0;
	static AllUsersArray = [];
	static All_Add(socket)
	{
		console.log("++++ User", this.Temp_ID);
		this.AllUsersArray.push(new User(this.Temp_ID, socket));
		this.Temp_ID++;
	}
	static All_Remove(temp_id)
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			if (this.AllUsersArray[i].Temp_ID == temp_id)
			{
				console.log("---- User", temp_id);
				this.AllUsersArray[i].IsConnected = false;
				this.AllUsersArray.splice(i, 1);
				return;
			}
		}
	}
	static All_GetByID(id)
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			const user = this.AllUsersArray[i];
			if (user.IsConnected && user.IsLoggedIn && user.DB_User.id == id)
			{
				return user;
			}
		}
		return null;
	}
	static All_Table()
	{
		var table = '[';
		var notFirst = false;
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			const user = this.AllUsersArray[i];
			if (user.IsConnected && user.IsLoggedIn)
			{
				if (notFirst) { table += ','; }
				else { notFirst = true; }
				table += user.ToTableJSON();
			}
		}
		return table + ']';
	}
	static All_Invite_Tables()
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			const user = this.AllUsersArray[i];
			if (user.IsConnected && user.IsLoggedIn)
			{
				const table = user.InvitesList_Table();
				user.SendText(api.INVITE_Table + table);
			}
		}
	}
	static All_Send(text)
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			const user = this.AllUsersArray[i];
			if (user.IsConnected)
			{
				user.SendText(text);
			}
		}
	}
	static All_SearchUserData(id)
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
}
