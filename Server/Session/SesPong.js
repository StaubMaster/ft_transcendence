import * as api from '../../Help/API_Const.js';
import * as database from '../DataBase.js';
import { TimeCountDown } from '../../Help/TimeCountDown.js';
import { SimPong } from '../Simulation/SimPong.js';



export class SessionPong
{
	isGameOver;

	UserL;
	UserR;

	ScoreL;
	ScoreR;

	Result;
	ResultL;
	ResultR;

	Sim;

	PresanceCheckCountDown;

	constructor(userL, userR)
	{
		this.isGameOver = false;

		this.UserL = userL;
		this.UserR = userR;

		this.UserL.IsActive = false;
		this.UserR.IsActive = false;

		this.Result = "...";
		this.ResultL = "...";
		this.ResultR = "...";

		this.PresanceCheckCountDown = new TimeCountDown(1, 10);

		this.SendTextAll(api.SESSION_Start);

		this.SendTextAll(api.API_SES_State + 'waiting for user input ' + this.PresanceCheckCountDown.TickRemaining);

		this.SendTextAll(api.API_SES_L_ID + this.UserL.DB_User.id);
		this.SendTextAll(api.API_SES_L_Name + this.UserL.DB_User.UserName);
		this.SendTextAll(api.API_SES_L_State + this.ResultL);

		this.SendTextAll(api.API_SES_R_ID + this.UserR.DB_User.id);
		this.SendTextAll(api.API_SES_R_Name + this.UserR.DB_User.UserName);
		this.SendTextAll(api.API_SES_R_State + this.ResultR);

		this.ScoreL = 0;
		this.ScoreR = 0;
		this.SendScoreAll();

		this.Sim = new SimPong(this);
	}



	SendTextAll(text)
	{
		if (this.UserL.Temp_ID == this.UserR.Temp_ID)
		{
			this.UserL.SendText(text);
		}
		else
		{
			this.UserL.SendText(text);
			this.UserR.SendText(text);
		}
	}
	SendScoreAll()
	{
		this.SendTextAll(api.API_SES_L_Score + this.ScoreL);
		this.SendTextAll(api.API_SES_R_Score + this.ScoreR);
	}
	SendSimData(name, data)
	{
		this.SendTextAll('Simulation-Data: { "name": "' + name + '", "data": ' + data + ' }');
	}



	ResultLChange(state)
	{
		this.ResultL = state;
		this.SendTextAll(api.API_SES_L_State + this.ResultL);
	}
	ResultRChange(state)
	{
		this.ResultR = state;
		this.SendTextAll(api.API_SES_R_State + this.ResultR);
	}



	GameOver()
	{
		this.isGameOver = true;
		this.SendTextAll(api.SESSION_End);

		console.log("Session End");
		console.log("Result: " + this.Result);
		console.log("L:", this.UserL.DB_User.id, this.ScoreL, this.ResultL);
		console.log("R:", this.UserR.DB_User.id, this.ScoreR, this.ResultR);
		database.InsertSession(this.Result, 0,
			this.UserL.DB_User.id, this.ScoreL, this.ResultL,
			this.UserR.DB_User.id, this.ScoreR, this.ResultR
		);
	}



	CheckPresance()
	{
		this.PresanceCheckCountDown.update();

		if (this.PresanceCheckCountDown.isDone)
		{
			this.PresanceCheckCountDown = null;
			this.Result = "Presance check Failed";
			if (this.UserL.IsActive) { this.ResultL = "was here"; } else { this.ResultL = "wasn't here"; }
			if (this.UserR.IsActive) { this.ResultR = "was here"; } else { this.ResultR = "wasn't here"; }
			this.GameOver();
			return;
		}

		if (this.PresanceCheckCountDown.lastUpdateWasTick)
		{
			this.SendTextAll(api.API_SES_State + 'waiting for user input ' + this.PresanceCheckCountDown.TickRemaining);
		}

		if (this.ResultL == "..." && this.UserL.IsActive)
		{
			this.ResultLChange("here");
		}
		if (this.ResultR == "..." && this.UserR.IsActive)
		{
			this.ResultRChange("here");
		}

		if (this.UserL.IsActive && this.UserR.IsActive)
		{
			this.PresanceCheckCountDown = null;
			return;
		}
	}

	CheckScore()
	{
		if (this.ScoreL >= 3 || this.ScoreR >= 3)
		{
			this.Result = "Winning Score";
			if (this.ScoreL > this.ScoreR)
			{
				this.ResultL = "winner";
				this.ResultR = "loser";
			}
			else if (this.ScoreL < this.ScoreR)
			{
				this.ResultL = "loser";
				this.ResultR = "winner";
			}
			else
			{
				this.ResultL = "tie";
				this.ResultR = "tie";
			}
			this.GameOver();
		}
	}

	CheckConnection()
	{
		if (!this.UserL.IsConnected || !this.UserR.IsConnected)
		{
			this.Result = "Disconnection";
			if (!this.UserL.IsConnected) { this.ResultL = "disconnect"; } else { this.ResultL = "default"; }
			if (!this.UserR.IsConnected) { this.ResultR = "disconnect"; } else { this.ResultR = "default"; }
			this.GameOver();
			return true;
		}
		return false;
	}



	Update()
	{
		if (this.isGameOver) { return; }
		if (this.CheckConnection()) { return; }
		if (this.PresanceCheckCountDown != null)
		{
			this.CheckPresance();
			return;
		}
		this.Sim.Update();
		this.CheckScore();
	}





	static AllSessionsPong = [];
	static All_Add(userL, userR)
	{
		console.log("++++ Session Pong ++++");
		this.AllSessionsPong.push(new SessionPong(userL, userR));
	}
	static All_Update()
	{
		for (var i = 0; i < this.AllSessionsPong.length; i++)
		{
			this.AllSessionsPong[i].Update();
			if (this.AllSessionsPong[i].isGameOver)
			{
				console.log("---- Session Pong ----");
				this.AllSessionsPong.splice(i, 1);
				i--;
			}
		}
	}
	static All_SearchByUserID(user_id)
	{
		const found = database.FindSearchUserID(user_id);
		/*var str = '[';
		var notFirst = false;
		for (var i = 0; i < found.length; i++)
		{
			const ses = found[i];
			if (notFirst) { str += ','; }
			else { notFirst = true; }
			str += '{';
			str += '"ID":'        + ses.ID + ',';
			str += '"Result":"'   + ses.Result + '",';
			str += '"Tour_ID":'   + ses.Tour_ID + ',';
			str += '"L_ID":'      + ses.L_ID + ',';
			str += '"L_Score":'   + ses.L_Score + ',';
			str += '"L_Result":"' + ses.L_Result + '",';
			str += '"R_ID":'      + ses.R_ID + ',';
			str += '"R_Score":'   + ses.R_Score + ',';
			str += '"R_Result":"' + ses.R_Result + '"';
			str += '}';
		}
		str += ']';
		return str;*/
		return JSON.stringify(found);
	}
}
