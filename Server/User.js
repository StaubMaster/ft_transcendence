import * as api from './API_Const.js';
import { SessionPong } from './Session/SesPong.js';
import { TimeTicker } from './TimeTicker.js';

export class User
{
	ws;
	DB_User;

	DisConnect;

	InvitedUser;
	InvitesList;

	PressUP;
	PressDW;

	Status;

	constructor(ws, DB_User)
	{
		this.ws = ws;
		this.DB_User = DB_User;

		this.InvitedUser = null;
		this.InvitesList = [];
		this.DisConnect = false;

		this.PressUP = false;
		this.PressDW = false;

		this.Status = 0;
	}

	SendText(text)
	{
		this.ws.send(text);
	}

	GetTable()
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
			table += this.InvitesList[i].GetTable(-1);
		}
		return table + ']';
	}



	ParseMessage(msg)
	{
		if (msg.startsWith(api.API_USER_NAME))
		{
			const value = msg.substr(api.API_USER_NAME.length);
			this.Name = value;
		}
		else if (msg.startsWith(api.INVITE_Request_ID))
		{
			const value = msg.substr(api.INVITE_Request_ID.length);
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
		else if (msg.startsWith(api.INVITE_Accept_ID))
		{
			const value = msg.substr(api.INVITE_Accept_ID.length);
			var user = this.InvitesList_Find(value);
			if (user != null)
			{
				SessionPong.All_Add(this, user);
			}
		}
		/*else if (msg.startsWith(api.API_USER_INVITE))
		{
			const value = msg.substr(api.API_USER_INVITE.length);
			//console.log("#" + api.API_USER_INVITE + "#'" + value + "'");
			if (value == this.DB_User.id)
			{
				console.log(".... Invite Self");
				SessionPong.All_Add(this, this);
			}
			else
			{
				console.log("INVITE OTHER: Out of Service");
				const other = All_GetByID(value);
				if (other != null)
				{
					if (other.HasInviteRecvFromID(this.ID))
					{
						console.log(".... Invite Accept");
						//	create Session
					}
					else
					{
						console.log(".... Invite Other");
						other.InvitesRecvFromOthersList.push(this);
					}
				}
				else
				{
					console.log("!!!! User not found");
				}
			}
		}*/
		else if (msg.startsWith(api.API_USER_IAMHERE))
		{
			const value = msg.substr(api.API_USER_IAMHERE.length);
			console.log("#" + api.API_USER_IAMHERE + "#'" + value + "'");
		}
		else if (msg.startsWith(api.API_USER_SESSION))
		{
			const value = msg.substr(api.API_USER_SESSION.length);
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
			console.log("Unidentified Message: '" + msg + "'");
		}
	}



	static AllUsersArray = [];
	static All_Add(ws, DB_User)
	{
		console.log("++++ User", DB_User.id);
		var user = new User(ws, DB_User);
		this.AllUsersArray.push(user);
		return user;
	}
	static All_Remove(id)
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			if (this.AllUsersArray[i].DB_User.id == id)
			{
				console.log("---- User", id);
				this.AllUsersArray.splice(i, i + 1);
				i--;
				return;
			}
		}
	}
	static All_GetByID(id)
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			if (this.AllUsersArray[i].DB_User.id == id)
			{
				return this.AllUsersArray[i];
			}
		}
		return null;
	}
	static All_Table()
	{
		var table = '[';
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			if (i != 0) { table += ','; }
			table += this.AllUsersArray[i].GetTable();
		}
		return table + ']';
	}
	static All_Invite_Tables()
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			const table = this.AllUsersArray[i].InvitesList_Table();
			this.AllUsersArray[i].SendText(api.INVITE_Table + table);
		}
	}
}
