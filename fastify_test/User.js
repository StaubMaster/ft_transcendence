
const API_USER_ID = "ID: ";
const API_USER_NAME = "Change-Name: ";
const API_USER_INVITE = "Invite: ";

const AllUsersArray = [];
export function AllUsers_Add(ws)
{
	console.log("++++ User ++++");
	AllUsersArray.push(new User(ws));
}
export function AllUsers_Remove(id)
{
	for (var i = 0; i < AllUsersArray.length; i++)
	{
		if (AllUsersArray[i].ID == id)
		{
			console.log("---- User ----");
			AllUsersArray.slice(i, i + 1);
			i--;
			return;
		}
	}
}

export class User
{
	static ID = 0;

	ws;
	ID;
	Name;

	InvitesSendToOthersList;
	InvitesRecvFromOthersList;

	constructor(ws)
	{
		this.ws = ws;

		this.ID = User.ID;
		User.ID++;

		const user = this;
		this.ws.onerror = function(e)
		{
			console.log(user.ID + " socket error: ", e);
		};
		this.ws.onclose = function(e)
		{
			console.log(user.ID + " socket closed:" + e.code + ":" + e.reason);
			AllUsers_Remove(user.ID);
		};
		this.ws.onopen = function()
		{
			socket.send('test');
			this.ws.send(API_USER_ID + user.ID);
		};
		this.ws.onmessage = function(e)
		{
			console.log(user.ID + ' "' + e.data + '"');
		};
	}
}
