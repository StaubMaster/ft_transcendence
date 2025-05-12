import * as api from '../../Help/API_Const.js';
import { TimeCountDown } from '../../Help/TimeCountDown.js';
import { SimPong } from '../Simulation/SimPong.js';

export class SessionPong
{
	isGameOver;

	UserL;
	UserR;

	ScoreL;
	ScoreR;

	StatusL;
	StatusR;

	Sim;

	PresanceCheckCountDown;

	constructor(userL, userR)
	{
		this.isGameOver = false;

		this.UserL = userL;
		this.UserR = userR;

		this.UserL.IsActive = false;
		this.UserR.IsActive = false;

		this.StateL = "...";
		this.StateR = "...";

		this.PresanceCheckCountDown = new TimeCountDown(1, 10);

		this.SendTextAll(api.SESSION_Start);

		this.SendTextAll(api.API_SES_State + 'waiting for user input ' + this.PresanceCheckCountDown.TickRemaining);

		this.SendTextAll(api.API_SES_L_ID + this.UserL.DB_User.id);
		this.SendTextAll(api.API_SES_L_Name + this.UserL.DB_User.UserName);
		this.SendTextAll(api.API_SES_L_State + this.StateL);

		this.SendTextAll(api.API_SES_R_ID + this.UserR.DB_User.id);
		this.SendTextAll(api.API_SES_R_Name + this.UserR.DB_User.UserName);
		this.SendTextAll(api.API_SES_R_State + this.StateR);

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

	StateLChange(state)
	{
		this.StateL = state;
		this.SendTextAll(api.API_SES_L_State + this.StateL);
	}
	StateRChange(state)
	{
		this.StateR = state;
		this.SendTextAll(api.API_SES_R_State + this.StateR);
	}

	GameOver()
	{
		this.isGameOver = true;
		this.SendTextAll(api.SESSION_End);

		console.log("Session End");
		console.log("Score: " + this.ScoreL + " : " + this.ScoreR);
		console.log("State: " + this.StateL + " : " + this.StateR);
	}

	CheckPresance()
	{
		this.PresanceCheckCountDown.update();

		if (this.PresanceCheckCountDown.isDone)
		{
			this.PresanceCheckCountDown = null;
			if (this.UserL.IsActive) { this.StateL = "was here"; } else { this.StateL = "wan't here"; }
			if (this.UserR.IsActive) { this.StateR = "was here"; } else { this.StateR = "wan't here"; }
			this.GameOver();
			return;
		}

		if (this.PresanceCheckCountDown.lastUpdateWasTick)
		{
			this.SendTextAll(api.API_SES_State + 'waiting for user input ' + this.PresanceCheckCountDown.TickRemaining);
		}

		if (this.StateL == "..." && this.UserL.IsActive)
		{
			this.StateLChange("here");
		}
		if (this.StateR == "..." && this.UserR.IsActive)
		{
			this.StateRChange("here");
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
			if (this.ScoreL > this.ScoreR)
			{
				this.StateL = "winner";
				this.StateR = "loser";
			}
			else if (this.ScoreL < this.ScoreR)
			{
				this.StateL = "loser";
				this.StateR = "winner";
			}
			else
			{
				this.StateL = "tie";
				this.StateR = "tie";
			}
			this.GameOver();
		}
	}

	CheckConnection()
	{
		if (!this.UserL.IsConnected || !this.UserR.IsConnected)
		{
			if (!this.UserL.IsConnected) { this.StateL = "disconnect"; } else { this.StateL = "default"; }
			if (!this.UserR.IsConnected) { this.StateR = "disconnect"; } else { this.StateR = "default"; }
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
	
}
