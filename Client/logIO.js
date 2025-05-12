import * as api from './Help/API_Const.js';
import * as check from './Help/loginCheck.js';



function GetNamePass()
{
	var InfoLabel = document.getElementById("login-info-field");

	var UserNameField = document.getElementById("login-username-field");
	var PassWordField = document.getElementById("login-password-field");
	var UserName = UserNameField.value;
	var PassWord = PassWordField.value;

	if (!check.lazyCheckAlphaNumeric(UserName))
	{
		InfoLabel.textContent = "UserName is not AlphaNumeric";
		return;
	}
	if (!check.lazyCheckAlphaNumeric(PassWord))
	{
		InfoLabel.textContent = "PassWord is not AlphaNumeric";
		return;
	}

	return [UserName, PassWord];
}



export function AccountLogIn()
{
	var InfoLabel = document.getElementById("login-info-field");
	InfoLabel.textContent = "";

	const ret = GetNamePass();
	if (ret === undefined) { return; }
	const [UserName, PassWord] = ret;

	IsWaiting = true;
	InfoLabel.textContent = "logging in ...";
	WebSocket_Send(api.LOGIN + UserName + ", " + PassWord);
}
export function AccountLogOut()
{
	var InfoLabel = document.getElementById("login-info-field");
	InfoLabel.textContent = "";

	IsWaiting = true;
	InfoLabel.textContent = "logging out ...";
	WebSocket_Send(api.LOGOUT);
}
export function AccountRegister()
{
	var InfoLabel = document.getElementById("login-info-field");
	InfoLabel.textContent = "";

	const ret = GetNamePass();
	if (ret === undefined) { return; }
	const [UserName, PassWord] = ret;

	IsWaiting = true;
	InfoLabel.textContent = "registering ...";
	WebSocket_Send(api.REGISTER + UserName + ", " + PassWord);
}
var deleteRepeatPress = 0;
export function AccountDeleteMe()
{
	var InfoLabel = document.getElementById("login-info-field");
	if (deleteRepeatPress == 0)
	{
		IsWaiting = true;
		InfoLabel.textContent = "deleting ...";
		WebSocket_Send("DeleteMe");
	}
	else
	{
		InfoLabel.textContent = "press " + deleteRepeatPress + " more time(s) to delete";
		deleteRepeatPress--;
	}
}



var IsLoggedIn = false;
var IsWaiting = false;
export function AccountLogInLogOut()
{
	if (IsWaiting) { return; }

	if (!IsLoggedIn)
	{
		AccountLogIn();
	}
	else
	{
		AccountLogOut();
	}
}
export function AccountRegisterDeleteMe()
{
	if (IsWaiting) { return; }

	if (!IsLoggedIn)
	{
		AccountRegister();
	}
	else
	{
		AccountDeleteMe();
	}
}
window.AccountLogInLogOut = AccountLogInLogOut;
window.AccountRegisterDeleteMe = AccountRegisterDeleteMe;



export function AccountChangeInfo(text)
{
	IsWaiting = false;
	var InfoLabel = document.getElementById("login-info-field");
	InfoLabel.textContent = text;
}
export function AccountChangeLogIn()
{
	IsWaiting = false;
	IsLoggedIn = true;

	document.getElementById("login-field").style.display = "none";
	document.getElementById("logged-field").style.display = "block";

	document.getElementById("account-logIO").textContent = "Log Out"
	document.getElementById("account-RegDel").textContent = "Delete Me";

	deleteRepeatPress = 5;

	var InfoLabel = document.getElementById("login-info-field");
	InfoLabel.textContent = "Logged In";
}
export function AccountChangeLogOut()
{
	IsWaiting = false;
	IsLoggedIn = false;

	document.getElementById("login-field").style.display = "block";
	document.getElementById("logged-field").style.display = "none";

	document.getElementById("account-logIO").textContent = "Log In"
	document.getElementById("account-RegDel").textContent = "Register";

	var InfoLabel = document.getElementById("login-info-field");
	InfoLabel.textContent = "Logged Out";
}
