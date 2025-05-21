import * as api from '../Help/API_Const.js';
import * as database from '../DataBase.js';
import { TimeCountDown } from '../Help/TimeCountDown.js';
import { SimPong } from '../Simulation/SimPong.js';
import { PortI } from '../../MultiService/PortI.js';
import { PortO } from '../../MultiService/PortO.js';

/*	what does SessionPong want from the outside ?

User Update
WebSocket send

*/

const portI = new PortI('localhost', 2000);
const portO = new PortO('localhost', 1000);

portO.post('/register', { host: portI.host, port: portI.port, path: '/SessionAdd' });
portO.post('/register', { host: portI.host, port: portI.port, path: '/SessionUser' });

portI.fastify.post('/:path', async function (request, reply)
{
	//console.log("path'" + request.params.path + "'");
	//console.log("body'" + request.body + "'");
	if (request.params.path == "SessionAdd")
	{
		const data = JSON.parse(request.body);
		const UserL = data.L;
		const UserR = data.R;

		SessionPong.All_Add(UserL, UserR);

		reply.code(200);
		reply.send("OK");
	}
	else if (request.params.path == "SessionUser")
	{
		const data = JSON.parse(request.body);
		const user = data.user;
		const session_id = data.session_id;

		const session = SessionPong.All_FindSessionID(session_id);
		if (session)
		{
			if (session.UserL.user_id == user.user_id) { session.UserL = user; }
			if (session.UserR.user_id == user.user_id) { session.UserR = user; }
		}

		reply.code(200);
		reply.send("OK");
	}
	else
	{
		reply.code(500);
		reply.send("Cannot Provide");
	}
});
portI.run();



setInterval(function ()
{
	SessionPong.All_Update();
}, 1);



export class SessionPong
{
	Temp_ID;

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

	InputUpL;
	InputDwL;
	InputUpR;
	InputDwR;

	Sim;

	Tournament;

	constructor(temp_id, userL, userR, tour)
	{
		this.Temp_ID = temp_id;

		this.IsDone = false;

		this.UserL = userL;
		this.UserR = userR;

		this.UserL.IsActive = false;
		this.UserR.IsActive = false;

		this.UserL.IsInSession = true;
		this.UserR.IsInSession = true;

		portO.request('POST', '/UserSessionAdd', { user_id: this.UserL.user_id, session_id: temp_id });
		portO.request('POST', '/UserSessionAdd', { user_id: this.UserR.user_id, session_id: temp_id });

		this.ScoreL = 0;
		this.ScoreR = 0;

		this.EndReason = api.SESSION_DEFAULT_END_REASON;
		this.EndStateL = api.SESSION_DEFAULT_END_STATE;
		this.EndStateR = api.SESSION_DEFAULT_END_STATE;
		this.Winner = api.SESSION_WINNER_NONE;

		this.CountDownCheckActive = new TimeCountDown(1, 10);
		this.CountDownShowResult = null;

		this.InputUpL = false;
		this.InputDwL = false;
		this.InputUpR = false;
		this.InputDwR = false;

		this.Sim = new SimPong(this);

		this.Tournament = tour;



		this.SendTextAll(api.SESSION_Start);

		this.SendTextAll(api.SESSION_State + api.SESSION_INFO_ACTIVITY_TIMER + this.CountDownCheckActive.TickRemaining);

		this.SendTextAll(api.SESSION_L_ID + this.UserL.user_id);
		this.SendTextAll(api.SESSION_R_ID + this.UserR.user_id);

		this.SendTextAll(api.SESSION_L_Name + this.UserL.user_name);
		this.SendTextAll(api.SESSION_R_Name + this.UserR.user_name);

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

		//if (this.UserL.Temp_ID == this.UserR.Temp_ID)
		if (this.UserL.user_id == this.UserR.user_id)
		{
			//this.UserL.SendText(text);
			portO.request('POST', '/UserSocketSend', { user_id: this.UserL.user_id, message: text });
		}
		else
		{
			//this.UserL.SendText(text);
			//this.UserR.SendText(text);
			portO.request('POST', '/UserSocketSend', { user_id: this.UserL.user_id, message: text });
			portO.request('POST', '/UserSocketSend', { user_id: this.UserR.user_id, message: text });
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
	ScoreLInc()
	{
		this.ScoreL++;
		this.SendScoreAll();
	}
	ScoreRInc()
	{
		this.ScoreR++;
		this.SendScoreAll();
	}



	GameOver()
	{
		console.log("Session End");
		console.log("Reason: " + this.EndReason);
		console.log("Winner: " + this.Winner);
		//console.log("L:", this.UserL.DB_User.id, this.ScoreL, this.EndStateL);
		//console.log("R:", this.UserR.DB_User.id, this.ScoreR, this.EndStateR);
		console.log("L:", this.UserL.user_id, this.ScoreL, this.EndStateL);
		console.log("R:", this.UserR.user_id, this.ScoreR, this.EndStateR);

		/*database.InsertSession(this.EndReason, this.Winner, -1,
			this.UserL.DB_User.id, this.ScoreL, this.EndStateL,
			this.UserR.DB_User.id, this.ScoreR, this.EndStateR
		);*/
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
		/*if (!this.UserL.CheckIsHere() || !this.UserR.CheckIsHere())
		{
			this.EndReason = api.SESSION_DISCONNECT_END_REASON;
			if (!this.UserL.CheckIsHere()) { this.EndStateL = api.SESSION_DISCONNECT_END_STATE_BAD; } else { this.EndStateL = api.SESSION_DISCONNECT_END_STATE_GOOD; }
			if (!this.UserR.CheckIsHere()) { this.EndStateR = api.SESSION_DISCONNECT_END_STATE_BAD; } else { this.EndStateR = api.SESSION_DISCONNECT_END_STATE_GOOD; }
			if (this.UserL.CheckIsHere() && !this.UserR.CheckIsHere()) { this.Winner = api.SESSION_WINNER_L; }
			if (!this.UserL.CheckIsHere() && this.UserR.CheckIsHere()) { this.Winner = api.SESSION_WINNER_R; }
			this.GameOver();
			return true;
		}*/
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



	Update_Input()
	{
		if (this.UserL.user_id != this.UserR.user_id)
		{
			this.InputUpL = this.UserL.InputUpL || this.UserL.InputUpR;
			this.InputDwL = this.UserL.InputDwL || this.UserL.InputDwR;
			this.InputUpR = this.UserR.InputUpL || this.UserR.InputUpR;
			this.InputDwR = this.UserR.InputDwL || this.UserR.InputDwR;
		}
		else
		{
			this.InputUpL = this.UserL.InputUpL;
			this.InputDwL = this.UserL.InputDwL;
			this.InputUpR = this.UserR.InputUpR;
			this.InputDwR = this.UserR.InputDwR;
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
		this.Update_Input();
		if (this.CountDownCheckActive != null)
		{
			this.CheckActive();
			return;
		}
		this.Sim.Update();
		this.CheckScore();
	}





	static Temp_ID = 0;
	static AllSessionsPong = [];
	static All_Add(userL, userR)
	{
		console.log("++++ Session Pong ++++");
		this.AllSessionsPong.push(new SessionPong(this.Temp_ID, userL, userR));
		this.Temp_ID++;
	}
	static All_Update()
	{
		for (var i = 0; i < this.AllSessionsPong.length; i++)
		{
			this.AllSessionsPong[i].Update();
			if (this.AllSessionsPong[i].IsDone)
			{
				console.log("---- Session Pong ----");
				this.AllSessionsPong.splice(i, 1);
				i--;
			}
		}
	}
	static All_FindSessionID(id)
	{
		for (var i = 0; i < this.AllSessionsPong.length; i++)
		{
			this.AllSessionsPong[i].Update();
			if (this.AllSessionsPong[i].Temp_ID == id)
			{
				return this.AllSessionsPong[i];
			}
		}
		return null;
	}
	static All_SearchByUserID(data)
	{
		return JSON.stringify(database.FindSearchUserID(data));
	}
	static All_SearchDetail(id)
	{
		return JSON.stringify(database.SessionSearchDetail(id));
	}
}
