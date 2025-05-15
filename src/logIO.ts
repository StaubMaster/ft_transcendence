
import * as api from './API_Const.js';
import * as nav from './navigator.js';
import * as ws from './WebSockert.js';



export function LogIO_Show()
{
	let section = document.getElementById("main-section-login") as HTMLElement;
	nav.MainSections_Select(section);
}
export function LogIO_Hide()
{
	let section = document.getElementById("main-section-login") as HTMLElement;
	section.style.display = "none";
}





function lazyCheckAlphaNumeric(str: string)
{
	var i, c;

	for (i = 0; i < str.length; i++)
	{
		c = str[i];
		if (!(c >= 'a' && c <= 'z') &&
			!(c >= 'A' && c <= 'Z') &&
			!(c >= '0' && c <= '9'))
		{
			return false;
		}
	}
	return true;
}
function GetNamePass()
{
	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;

	var UserNameField = document.getElementById("login-username-field") as HTMLInputElement;
	var PassWordField = document.getElementById("login-password-field") as HTMLInputElement;
	var UserName = UserNameField.value;
	var PassWord = PassWordField.value;

	if (!lazyCheckAlphaNumeric(UserName))
	{
		InfoLabel.textContent = "UserName is not AlphaNumeric";
		return;
	}
	if (!lazyCheckAlphaNumeric(PassWord))
	{
		InfoLabel.textContent = "PassWord is not AlphaNumeric";
		return;
	}

	return [UserName, PassWord];
}



var IsLoggedIn = false;
var IsWaiting = false;



export function AccountLogIn()
{
	if (IsWaiting) { return; }
	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;
	InfoLabel.textContent = "";

	const ret = GetNamePass();
	if (ret === undefined) { return; }
	const [UserName, PassWord] = ret;

	IsWaiting = true;
	InfoLabel.textContent = "logging in ...";
	ws.WebSocket_Send(api.USER_ACCOUNT_LOGIN + UserName + ", " + PassWord);
}
export function AccountLogOut()
{
	if (IsWaiting) { return; }
	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;
	InfoLabel.textContent = "";

	IsWaiting = true;
	InfoLabel.textContent = "logging out ...";
	ws.WebSocket_Send(api.USER_ACCOUNT_LOGOUT);
}
export function AccountRegister()
{
	if (IsWaiting) { return; }
	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;
	InfoLabel.textContent = "";

	const ret = GetNamePass();
	if (ret === undefined) { return; }
	const [UserName, PassWord] = ret;

	IsWaiting = true;
	InfoLabel.textContent = "registering ...";
	ws.WebSocket_Send(api.USER_ACCOUNT_REGISTER + UserName + ", " + PassWord);
}
var deleteRepeatPress = 0;
export function AccountDeleteMe()
{
	if (IsWaiting) { return; }
	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;
	if (deleteRepeatPress == 0)
	{
		IsWaiting = true;
		InfoLabel.textContent = "deleting ...";
		ws.WebSocket_Send(api.USER_ACCOUNT_DELETE_ME);
	}
	else
	{
		InfoLabel.textContent = "press " + deleteRepeatPress + " more time(s) to delete";
		deleteRepeatPress--;
	}
}



export function AccountChangeInfo(text: string)
{
	IsWaiting = false;
	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;
	InfoLabel.textContent = text;
}
export function AccountChangeLogIn()
{
	IsWaiting = false;
	IsLoggedIn = true;

	LogIO_Hide();
	nav.MainNavigator_Show();

	deleteRepeatPress = 5;

	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;
	InfoLabel.textContent = "Logged In";
}
export function AccountChangeLogOut()
{
	IsWaiting = false;
	IsLoggedIn = false;

	var InfoLabel = document.getElementById("login-info-field") as HTMLLabelElement;
	InfoLabel.textContent = "Logged Out";
}





let button_login = document.getElementById("button-login") as HTMLButtonElement;
button_login.onclick = AccountLogIn;
let button_register = document.getElementById("button-register") as HTMLButtonElement;
button_register.onclick = AccountRegister;


