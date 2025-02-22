
ws = null;
ID = -1;
gameID = -1;

function socketConn()
{
	if (ws == null)
	{
		ws = new WebSocket("ws");
		ws.binaryType = "arraybuffer";
		ws.onerror = function(e)
		{
			showWebSocketStatus();
			console.log("socket error: ", e);
		};
		ws.onclose = function(e)
		{
			ws = null; showWebSocketStatus();
			ID = -1; showYourID();
			console.log("socket closed:" + e.code + ":" + e.reason);
		};
		ws.onopen = function()
		{
			showWebSocketStatus();
			showYourID();
			ws.send("hello");
		};
		ws.onmessage = function(e)
		{
			var cmd_ID = "ID: ";
			var cmd_InviteRequestFrom = "Invite-Request-From: ";
			var cmd_JoinedGame = "JoinedGame: ";
			var cmd_LeftGame = "LeftGame: ";
			var cmd_PlayingWith = "Playing-With: ";
			var cmd_PresanceCheck = "Presance-Check: ";
			var cmd_BallData = "Ball-Data: ";

			if (e.data.startsWith(cmd_ID))
			{
				var cut = e.data.substring(cmd_ID.length);
				console.log(cmd_ID + "'" + cut + "'");
				ID = cut;
				showYourID();
			}
			else if (e.data.startsWith(cmd_InviteRequestFrom))
			{
				var cut = e.data.substring(cmd_InviteRequestFrom.length);
				console.log(cmd_InviteRequestFrom + "'" + cut + "'");
			}
			else if (e.data.startsWith(cmd_JoinedGame))
			{
				var cut = e.data.substring(cmd_JoinedGame.length);
				var gameID = document.getElementById("gameID");
				gameID.textContent = cut;
			}
			else if (e.data.startsWith(cmd_LeftGame))
			{
				var cut = e.data.substring(cmd_LeftGame.length);
				var gameID = document.getElementById("gameID");
				gameID.textContent = -1;
			}
			else if (e.data.startsWith(cmd_PlayingWith))
			{
				var cut = e.data.substring(cmd_PlayingWith.length);
				var otherID = document.getElementById("otherID");
				otherID.textContent = cut;
			}
			else if (e.data.startsWith(cmd_PresanceCheck))
			{
				var cut = e.data.substring(cmd_PresanceCheck.length);
				var presanceCheckStatus = document.getElementById("presanceCheckStatus");
				presanceCheckStatus.textContent = cut;
			}
			else if (e.data.startsWith(cmd_BallData))
			{
				var cut = e.data.substring(cmd_BallData.length);
				console.log(cmd_BallData + "'" + cut + "'");
			}
			else
			{
				console.log("message '" + e.data + "'");
			}
		};
	}
}

function socketDisc()
{
	if (ws != null)
	{
		ws.close();
	}
}



function showWebSocketStatus()
{
	var elem = document.getElementById("socketStatus");

	if (ws == null)
	{
		elem.textContent = "null";
	}
	else
	{
		if (ws.readyState == 0) { elem.textContent = "0 (CONNECTING)";}
		else if (ws.readyState == 1) { elem.textContent = "1 (OPEN)";}
		else if (ws.readyState == 2) { elem.textContent = "2 (CLOSING)";}
		else if (ws.readyState == 3) { elem.textContent = "3 (CLOSED)";}
		else { elem.textContent = ws.readyState + " (UNKNOWN)";}
	}
}

function showYourID()
{
	var elem = document.getElementById("socketID");
	elem.textContent = ID;
}



function InviteFunc()
{
	if (ws == null)
		return;
	elem = document.getElementById("InviteOtherID");
	if (elem == null)
		return;
	var invID = elem.value;
	ws.send("InviteRequestTo: " + invID);
}



function AcceptFunc()
{
	if (ws == null)
		return;

}



function I_Am_Here()
{
	if (ws != null)
	{
		ws.send("I-Am-Here");
	}
}

import * as BABYLON from '@babylonjs/core';
const canvas = document.getElementById('can');



