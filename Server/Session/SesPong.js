import * as api from '../../Help/API_Const.js';
import * as database from '../DataBase.js';
import { TimeCountDown } from '../../Help/TimeCountDown.js';
import { SimPong } from '../Simulation/SimPong.js';



export class SessionPong
{
	IsDone;

	UserL;
	UserR;

	ScoreL;
	ScoreR;

	EndReason;
	EndStateL;
	EndStateR;
	Winner;

	CountDownCheckActive;
	CountDownShowResult;

	Sim;

	Tournament;

	constructor(userL, userR, tour)
	{
		this.IsDone = false;

		this.UserL = userL;
		this.UserR = userR;

		this.UserL.IsActive = false;
		this.UserR.IsActive = false;

		this.UserL.IsInSession = true;
		this.UserR.IsInSession = true;

		this.ScoreL = 0;
		this.ScoreR = 0;

		this.EndReason = api.SESSION_DEFAULT_END_REASON;
		this.EndStateL = api.SESSION_DEFAULT_END_STATE;
		this.EndStateR = api.SESSION_DEFAULT_END_STATE;
		this.Winner = api.SESSION_WINNER_NONE;

		this.CountDownCheckActive = new TimeCountDown(1, 10);
		this.CountDownShowResult = null;

		this.Sim = new SimPong(this);

		this.Tournament = tour;



		this.SendTextAll(api.SESSION_Start);

		this.SendTextAll(api.SESSION_State + api.SESSION_INFO_ACTIVITY_TIMER + this.CountDownCheckActive.TickRemaining);

		this.SendTextAll(api.SESSION_L_ID + this.UserL.DB_User.id);
		this.SendTextAll(api.SESSION_R_ID + this.UserR.DB_User.id);

		this.SendTextAll(api.SESSION_L_Name + this.UserL.DB_User.UserName);
		this.SendTextAll(api.SESSION_R_Name + this.UserR.DB_User.UserName);

		this.SendTextAll(api.SESSION_L_State + this.EndStateL);
		this.SendTextAll(api.SESSION_R_State + this.EndStateR);

		this.SendScoreAll();
	}



	SendTextAll(text)
	{
		if (this.Tournament !== undefined && this.Tournament != null)
		{
			//	SendTextAll in Tournament
		}

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
		this.SendTextAll(api.SESSION_L_Score + this.ScoreL);
		this.SendTextAll(api.SESSION_R_Score + this.ScoreR);
	}
	SendSimData(name, data)
	{
		this.SendTextAll('Simulation-Data: { "name": "' + name + '", "data": ' + data + ' }');
	}



	GameOver()
	{
		console.log("Session End");
		console.log("Reason: " + this.EndReason);
		console.log("Winner: " + this.Winner);
		console.log("L:", this.UserL.DB_User.id, this.ScoreL, this.EndStateL);
		console.log("R:", this.UserR.DB_User.id, this.ScoreR, this.EndStateR);

		database.InsertSession(this.EndReason, this.Winner, -1,
			this.UserL.DB_User.id, this.ScoreL, this.EndStateL,
			this.UserR.DB_User.id, this.ScoreR, this.EndStateR
		);
		this.CountDownShowResult = new TimeCountDown(1, 5);

		this.SendTextAll(api.SESSION_L_State + this.EndStateL);
		this.SendTextAll(api.SESSION_R_State + this.EndStateR);
		this.SendTextAll(api.SESSION_State + api.SESSION_INFO_RESULT_TIMER + this.CountDownShowResult.TickRemaining);
	}





	CheckActive()
	{
		this.CountDownCheckActive.update();

		if (this.CountDownCheckActive.isDone)
		{
			this.CountDownCheckActive = null;
			this.EndReason = api.SESSION_INACTIVITY_END_REASON;
			if (this.UserL.IsActive) { this.EndStateL = api.SESSION_INACTIVITY_END_STATE_GOOD; } else { this.EndStateL = api.SESSION_INACTIVITY_END_STATE_BAD; }
			if (this.UserR.IsActive) { this.EndStateR = api.SESSION_INACTIVITY_END_STATE_GOOD; } else { this.EndStateR = api.SESSION_INACTIVITY_END_STATE_BAD; }
			if (this.UserL.IsActive && !this.UserR.IsActive) { this.Winner = api.SESSION_WINNER_L; }
			if (!this.UserL.IsActive && this.UserR.IsActive) { this.Winner = api.SESSION_WINNER_R; }
			this.GameOver();
			return;
		}

		if (this.CountDownCheckActive.lastUpdateWasTick)
		{
			this.SendTextAll(api.SESSION_State + api.SESSION_INFO_ACTIVITY_TIMER + this.CountDownCheckActive.TickRemaining);
		}

		if (this.EndStateL == api.SESSION_DEFAULT_END_STATE && this.UserL.IsActive)
		{
			this.EndStateL = api.SESSION_ACTIVE_END_STATE;
			this.SendTextAll(api.SESSION_L_State + this.EndStateL);
		}
		if (this.EndStateR == api.SESSION_DEFAULT_END_STATE && this.UserR.IsActive)
		{
			this.EndStateR = api.SESSION_ACTIVE_END_STATE;
			this.SendTextAll(api.SESSION_R_State + this.EndStateR);
		}

		if (this.UserL.IsActive && this.UserR.IsActive)
		{
			this.CountDownCheckActive = null;
			this.SendTextAll(api.SESSION_State + api.SESSION_ACTIVE_END_REASON);
			return;
		}
	}

	CheckScore()
	{
		if (this.ScoreL >= 3 || this.ScoreR >= 3)
		{
			this.EndReason = api.SESSION_SCORE_END_REASON;
			if (this.ScoreL > this.ScoreR)
			{
				this.EndStateL = api.SESSION_SCORE_END_STATE_GOOD;
				this.EndStateR = api.SESSION_SCORE_END_STATE_BAD;
				this.Winner = api.SESSION_WINNER_L;
			}
			else if (this.ScoreL < this.ScoreR)
			{
				this.EndStateL = api.SESSION_SCORE_END_STATE_BAD;
				this.EndStateR = api.SESSION_SCORE_END_STATE_GOOD;
				this.Winner = api.SESSION_WINNER_R;
			}
			else
			{
				this.EndStateL = api.SESSION_SCORE_END_STATE_NEUTRAL;
				this.EndStateR = api.SESSION_SCORE_END_STATE_NEUTRAL;
			}
			this.GameOver();
		}
	}

	CheckConnection()
	{
		if (!this.UserL.CheckIsHere() || !this.UserR.CheckIsHere())
		{
			this.EndReason = api.SESSION_DISCONNECT_END_REASON;
			if (!this.UserL.CheckIsHere()) { this.EndStateL = api.SESSION_DISCONNECT_END_STATE_BAD; } else { this.EndStateL = api.SESSION_DISCONNECT_END_STATE_GOOD; }
			if (!this.UserR.CheckIsHere()) { this.EndStateR = api.SESSION_DISCONNECT_END_STATE_BAD; } else { this.EndStateR = api.SESSION_DISCONNECT_END_STATE_GOOD; }
			if (this.UserL.CheckIsHere() && !this.UserR.CheckIsHere()) { this.Winner = api.SESSION_WINNER_L; }
			if (!this.UserL.CheckIsHere() && this.UserR.CheckIsHere()) { this.Winner = api.SESSION_WINNER_R; }
			this.GameOver();
			return true;
		}
		return false;
	}

	ShowResult()
	{
		this.CountDownShowResult.update();

		if (this.CountDownShowResult.isDone)
		{
			this.UserL.IsInSession = false;
			this.UserR.IsInSession = false;
			this.SendTextAll(api.SESSION_End);
			this.IsDone = true;
			return;
		}

		if (this.CountDownShowResult.lastUpdateWasTick)
		{
			this.SendTextAll(api.SESSION_State + api.SESSION_INFO_RESULT_TIMER + this.CountDownShowResult.TickRemaining);
		}
	}



	Update()
	{
		if (this.IsDone) { return; }
		if (this.CountDownShowResult != null)
		{
			this.ShowResult();
			return;
		}
		if (this.CheckConnection()) { return; }
		if (this.CountDownCheckActive != null)
		{
			this.CheckActive();
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
			if (this.AllSessionsPong[i].IsGameOver)
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
