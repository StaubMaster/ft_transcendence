
function lazyCheckAlphaNumeric(str)
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

isNotLogged = true;
function User_LogIO()
{
	if (isNotLogged)
	{
		var InfoLabel = document.getElementById("login-info-field");
		InfoLabel.textContent = "";

		var UserNameField = document.getElementById("login-username-field");
		var PassWordField = document.getElementById("login-password-field");
		var UserName = UserNameField.value;
		var PassWord = PassWordField.value;
		//UserNameField.value = "";
		//PassWordField.value = "";

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
		
		WebSocket_Send("LogIn: " + UserName + ", " + PassWord);
		InfoLabel.textContent = "logging in ...";
	}
	else
	{
		WebSocket_Send("LogOut");
	}
}
deleteRepeatPress = 0;
function User_Register_Delete()
{
	if (isNotLogged)
	{
		var InfoLabel = document.getElementById("login-info-field");
		InfoLabel.textContent = "";

		var UserNameField = document.getElementById("login-username-field");
		var PassWordField = document.getElementById("login-password-field");
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

		WebSocket_Send("Register: " + UserName + ", " + PassWord);
		InfoLabel.textContent = "registering in ...";
	}
	else
	{
		if (deleteRepeatPress == 0)
		{
			WebSocket_Send("DeleteMe");
		}
		else
		{
			document.getElementById("regDel").textContent = "press " + deleteRepeatPress + " more time(s) to delete";
			deleteRepeatPress--;
		}
	}
}

function User_LogIn_Change(response)
{
	if (response === undefined || response.length == 0)
	{
		isNotLogged = false;
		document.getElementById("login-field").style.display = "none";
		document.getElementById("logged-field").style.display = "block";
		document.getElementById("logIO").textContent = "Log Out";
		document.getElementById("regDel").textContent = "Delete Me";
		deleteRepeatPress = 5;

		var InfoLabel = document.getElementById("login-info-field");
		InfoLabel.textContent = "Logged In";
	}
	else
	{
		var InfoLabel = document.getElementById("login-info-field");
		InfoLabel.textContent = response;
	}
}

function User_LogOut_Change()
{
	isNotLogged = true;
	document.getElementById("login-field").style.display = "block";
	document.getElementById("logged-field").style.display = "none";
	document.getElementById("logIO").textContent = "Log In";
	document.getElementById("regDel").textContent = "Register";

	var InfoLabel = document.getElementById("login-info-field");
	InfoLabel.textContent = "";
}
