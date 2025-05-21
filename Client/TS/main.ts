import * as ws from './WebSockert.js';
import * as logIO from './logIO.js';
import * as invite from './SessionInvite.js';

//	can get all elements at the start
(document.getElementById("button-main-login") as HTMLButtonElement).onclick = logIO.LogIO_Show;
(document.getElementById("button-main-reconnect") as HTMLButtonElement).onclick = Reconnect;

export function MainDefault_Show()
{
	let main_default = document.getElementById("main-default") as HTMLElement;
	main_default.style.display = "block";
}
export function MainDefault_Hide()
{
	let main_default = document.getElementById("main-default") as HTMLElement;
	main_default.style.display = "none";
}
export function MainDefault_ServerError()
{
	let main_default = document.getElementById("main-server-error") as HTMLElement;
	main_default.style.display = "block";
}
export function MainDefault_Reset()
{
	let main_default = document.getElementById("main-server-error") as HTMLElement;
	main_default.style.display = "none";
}

function Reconnect()
{
	ws.WebSocket_Connect();
}



export function UserTable_Online_Update(json_string: string)
{
	let json_data = JSON.parse(json_string);

	invite.Online_Table_Update(json_data);
}

//	tsc --watch
