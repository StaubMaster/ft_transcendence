import * as api from './API_Const.js';
import { SessionPong } from './Session/SesPong.js';

export class User
{
	static ID = 0;

	ws;
	ID;
	Name;
	DisConnect;

	InvitesSendToOthersList;
	InvitesRecvFromOthersList;

	PressUP;
	PressDW;

	constructor(ws)
	{
		this.ws = ws;

		this.ID = User.ID;
		User.ID++;

		this.InvitesSendToOthersList = [];
		this.InvitesRecvFromOthersList = [];
		this.DisConnect = false;

		this.PressUP = false;
		this.PressDW = false;

		const user = this;
		this.ws.onerror = function(e)
		{
			console.log(user.ID + " socket error: ", e);
		};
		this.ws.onclose = function(e)
		{
			console.log(user.ID + " socket closed:" + e.code + ":" + e.reason);
			user.DisConnect = true;
			User.All_Remove(user.ID);
		};
		//this.ws.onopen = function() { };
		this.ws.onmessage = function(e)
		{
			//console.log(user.ID + ' "' + e.data + '"');
			user.ParseMessage(e.data);
		};

		this.ws.send(api.API_USER_ID + user.ID);
	}

	SendText(text)
	{
		this.ws.send(text);
	}

	GetTable(id)
	{
		var str = '{';

		str += '"ID":' + this.ID + ',';
		str += '"User":"' + this.Name + '",';
		str += '"Status":"';
		if (this.ID == id)
		{
			str += "this is you";
		}
		else
		{
			var invS = this.HasInviteSendToID(id);
			var invR = this.HasInviteRecvFromID(id);
			if (!invS && !invR)
				str += "none";
			else if (!invS && !invR)
				str += "invited you";
			else if (!invS && !invR)
				str += "you invited";
			else
				str += "mutual invite";
		}
		str += '"';

		return str + '}';
	}

	HasInviteSendToID(id)
	{
		for (var i = 0; i < this.InvitesSendToOthersList.length; i++)
		{
			if (this.InvitesSendToOthersList[i].ID == id)
			{
				return true
			}
		}
		return false;
	}
	HasInviteRecvFromID(id)
	{
		for (var i = 0; i < this.InvitesRecvFromOthersList.length; i++)
		{
			if (this.InvitesRecvFromOthersList[i].ID == id)
			{
				return true
			}
		}
		return false;
	}

	ParseMessage(msg)
	{
		if (msg.startsWith(api.API_USER_NAME))
		{
			const value = msg.substr(api.API_USER_NAME.length);
			this.Name = value;
		}
		else if (msg.startsWith(api.API_USER_INVITE))
		{
			const value = msg.substr(api.API_USER_INVITE.length);
			console.log("#" + api.API_USER_INVITE + "#'" + value + "'");
			if (value == this.ID)
			{
				console.log(".... Invite Self");
				//	create Session
				SessionPong.All_Add(this, this);
			}
			else
			{
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
		}
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
				//console.log("#" + api.API_USER_SESSION + "#'" + value + "'");
				console.log("Unknown Session Input '" + value + "'");
			}
		}
		else
		{
			console.log("Unidentified Message: '" + msg + "'");
		}
	}





	static AllUsersArray = [];
	static All_Add(ws)
	{
		console.log("++++ User ++++");
		this.AllUsersArray.push(new User(ws));
	}
	static All_Remove(id)
	{
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			if (this.AllUsersArray[i].ID == id)
			{
				console.log("---- User ----");
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
			if (this.AllUsersArray[i].ID == id)
			{
				return this.AllUsersArray[i];
			}
		}
		return null;
	}
	static All_Table(id)
	{
		var table = '[';
		for (var i = 0; i < this.AllUsersArray.length; i++)
		{
			if (i != 0) { table += ','; }
			table += this.AllUsersArray[i].GetTable(id);
		}
		return table + ']';
	}
}
