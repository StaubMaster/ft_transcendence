
import * as logIO from './logIO.js';
import * as invite from './invite.js';

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
	let main_default_h1 = document.getElementById("main-default-h1") as HTMLElement;
	let main_default_h2 = document.getElementById("main-default-h2") as HTMLElement;
	main_default_h1.textContent = "SERVER ERROR";
	main_default_h2.textContent = "An Error occured with the Server Connection";
}
export function MainDefault_Reset()
{
	let main_default_h1 = document.getElementById("main-default-h1") as HTMLElement;
	let main_default_h2 = document.getElementById("main-default-h2") as HTMLElement;
	main_default_h1.textContent = "HATE";
	main_default_h2.textContent = "I have no time, and I must Pong";
}

(document.getElementById("button-main-login") as HTMLButtonElement).onclick = logIO.LogIO_Show;



export function UserTable_Online_Update(json_string: string)
{
	let json_data = JSON.parse(json_string);

	invite.Online_Table_Update(json_data);
}

//	tsc --watch
