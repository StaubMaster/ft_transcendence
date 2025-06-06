import * as api from './Help/API_Const.js';
import * as database from './DataBase.js';
//import { SessionPong } from './Session/SesPong.js';
import { PortI } from '../MultiService/PortI.js';
import { PortO } from '../MultiService/PortO.js';

/*
	for now, when the user is part of a session and changes
	tell the session all relevent info about the user
	in the future, only tell the stuff that changed

what information sent to Sessions

	IsConnected
	IsLoggedIn
	IsActive

	InputUpL
	InputDwL
	InputUpR
	InputDwR

	(DB_User)
		only for displaying stats

what information sent from Sessions
	stuff to send with the WebSocket
*/

const portI = new PortI('localhost', 3000);
const portO = new PortO('localhost', 1000);

portO.post('/register', { host: portI.host, port: portI.port, path: '/UserSessionAdd' });
portO.post('/register', { host: portI.host, port: portI.port, path: '/UserSocketSend' });

portI.fastify.post('/:path', async function (request, reply)
{
	//console.log("path'" + request.params.path + "'");
	//console.log("body'" + request.body + "'");
	if (request.params.path == "UserSessionAdd")
	{
		const data = JSON.parse(request.body);
		const user_id = data.user_id;
		const session_id = data.session_id;

		const user = User.All_GetByID(user_id);
		user.SessionID = session_id;

		reply.code(200);
		reply.send("OK");
	}
	else if (request.params.path == "UserSocketSend")
	{
		const data = JSON.parse(request.body);
		const user_id = data.user_id;
		const message = data.message;

		const user = User.All_GetByID(user_id);
		if (user.IsConnected)
		{
			user.socket.send(message)
		}

		reply.code(200);
		reply.send("OK");
	}
	else
	{
		reply.code(500);
		reply.send("Cannot Provide '" + request.params.path + "'");
	}
});
portI.run();



function SendUser(user)
{
	portO.request('POST', '/SessionUser', user.ToSessionObject());
}



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

	InputUpL;
	InputDwL;
	InputUpR;
	InputDwR;

	IsInSession;
	IsInTournament;

	SessionID;

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

		this.InputUpL = false;
		this.InputDwL = false;
		this.InputUpR = false;
		this.InputDwR = false;

		this.IsInSession = false;
		this.IsInTournament = false;

		this.SessionID = -1;

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
		if (text.startsWith(api.SEARCH_SESSION_TABLE))
		{
			console.log(api.SEARCH_SESSION_TABLE, "is out of Service");
			//const data = JSON.parse(text.substr(api.SEARCH_SESSION_TABLE.length));
			//this.SendText(api.SEARCH_SESSION_TABLE + SessionPong.All_SearchByUserID(data));	//	SessionPong
			this.SendText(api.SEARCH_SESSION_TABLE);
		}
		else if (text.startsWith(api.SEARCH_SESSION_DETAIL))
		{
			console.log(api.SEARCH_SESSION_DETAIL, "is out of Service");
			//const value = text.substr(api.SEARCH_SESSION_DETAIL.length);
			//this.SendText(api.SEARCH_SESSION_DETAIL + SessionPong.All_SearchDetail(value));	//	SessionPong
			this.SendText(api.SEARCH_SESSION_DETAIL);
		}
		else if (text.startsWith(api.USER_ACCOUNT_LOGIN))
		{
			const value = text.substr(api.USER_ACCOUNT_LOGIN.length);
			const NamePass = value.split(", ");
			this.AccountLogIn(NamePass[0], NamePass[1]);
		}
		else if (text.startsWith(api.USER_ACCOUNT_LOGOUT))
		{
			this.AccountLogOut();
		}
		else if (text.startsWith(api.USER_ACCOUNT_REGISTER))
		{
			const value = text.substr(api.USER_ACCOUNT_REGISTER.length);
			const NamePass = value.split(", ");
			this.AccountRegister(NamePass[0], NamePass[1]);
		}
		else if (text.startsWith(api.USER_ACCOUNT_DELETE_ME))
		{
			this.AccountDeleteMe();
		}
		else if (text.startsWith(api.USER_INVITE_Request_ID))
		{
			const value = text.substr(api.USER_INVITE_Request_ID.length);
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
		else if (text.startsWith(api.USER_INVITE_Accept_ID))
		{
			const value = text.substr(api.USER_INVITE_Accept_ID.length);
			var user = this.InvitesList_Find(value);
			if (user != null)
			{
				console.log("Request new Session");
				//SessionPong.All_Add(this, user);	//	SessionPong
				/*
					should return new session ID
					User should remember the session that it is a part of
				*/
				const data = {
					L: this.ToSessionObject(),
					R: user.ToSessionObject(),
				};
				portO.request('POST', '/SessionAdd', data);
			}
		}
		else if (text.startsWith(api.API_USER_SESSION))
		{
			this.IsActive = true;
			const value = text.substr(api.API_USER_SESSION.length);
			if      (value == api.USER_INPUT_L_UP_PRESS) { this.InputUpL = true; }
			else if (value == api.USER_INPUT_L_DW_PRESS) { this.InputDwL = true; }
			else if (value == api.USER_INPUT_R_UP_PRESS) { this.InputUpR = true; }
			else if (value == api.USER_INPUT_R_DW_PRESS) { this.InputDwR = true; }
			else if (value == api.USER_INPUT_L_UP_RELEASE) { this.InputUpL = false; }
			else if (value == api.USER_INPUT_L_DW_RELEASE) { this.InputDwL = false; }
			else if (value == api.USER_INPUT_R_UP_RELEASE) { this.InputUpR = false; }
			else if (value == api.USER_INPUT_R_DW_RELEASE) { this.InputDwR = false; }
			else
			{
				console.log("Unknown Session Input '" + value + "'");
			}
			/*
				this should tell the session that the input changed
			*/
			portO.request('POST', '/SessionUser', { session_id: this.SessionID, user: this.ToSessionObject()});
		}
		else
		{
			console.log("Unidentified Message: '" + text + "'");
		}
	}

	ToSessionObject()
	{
		return {
			user_id: this.DB_User.id,
			user_name: this.DB_User.UserName,

			IsConnected: this.IsConnected,
			IsLoggedIn: this.IsLoggedIn,
			IsActive: this.IsActive,

			InputUpL: this.InputUpL,
			InputDwL: this.InputDwL,
			InputUpR: this.InputUpR,
			InputDwR: this.InputDwR,
		};
	}



	CheckIsHere()
	{
		return (this.IsConnected && this.IsLoggedIn);
	}
	GetStatus()
	{
		if (this.IsInTournament) { return api.USER_STATE_TOURNAMENT; }
		if (this.IsInSession) { return api.USER_STATE_SESION; }
		return api.USER_STATE_ONLINE;
	}



	//#region LOG IO
	AccountLogIn(UserName, PassWord)
	{
		if (this.IsLoggedIn)
		{
			this.SendText(api.USER_ACCOUNT_LOG_INFO + api.USER_ACCOUNT_ALREADY_LOGGED_IN);
			return;
		}
		const DB_User = database.CheckUser(UserName, PassWord);
		if (typeof DB_User == "string")
		{
			this.SendText(api.USER_ACCOUNT_LOG_INFO + DB_User);
			return;
		}
		this.SendText(api.USER_ACCOUNT_LOGIN);
		this.SendText(api.USER_ACCOUNT_ID + DB_User.id);
		this.SendText(api.USER_ACCOUNT_Name + DB_User.UserName);

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
			this.SendText(api.USER_ACCOUNT_LOG_INFO + api.USER_ACCOUNT_NOT_LOGGED_IN);
			return;
		}
		this.SendText(api.USER_ACCOUNT_LOGOUT);

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
			this.SendText(api.USER_ACCOUNT_LOG_INFO + api.USER_ACCOUNT_ALREADY_LOGGED_IN);
			return;
		}
		const ret = database.InsertUser(UserName, PassWord);
		if (ret !== undefined)
		{
			this.SendText(api.USER_ACCOUNT_LOG_INFO + ret);
			return;
		}
		this.AccountLogIn(UserName, PassWord);
	}
	AccountDeleteMe()
	{
		if (!this.IsLoggedIn)
		{
			this.SendText(api.USER_ACCOUNT_LOG_INFO + api.USER_ACCOUNT_NOT_LOGGED_IN);
			return;
		}
		database.RemoveUser(this.DB_User.UserName, this.DB_User.PassWord);
		this.AccountLogOut();
	}
	//#endregion

	//#region Invite
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
	//#endregion



	ToTableJSON()
	{
		var str = '{';
		str += '"ID":' + this.DB_User.id + ',';
		str += '"User":"' + this.DB_User.UserName + '",';
		str += '"Status":"';
		str += this.GetStatus();
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
		table += ']';
		User.All_Send(api.ALL_USERS_Table + table);
	}
	static All_Invite_Tables()
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			const user = this.AllUsersArray[i];
			if (user.IsConnected && user.IsLoggedIn)
			{
				const table = user.InvitesList_Table();
				user.SendText(api.USER_INVITE_Table + table);
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
				str += All_User.GetStatus();
			}
			str += '"';
			str += '}';
			return str;
		}
	}
}
