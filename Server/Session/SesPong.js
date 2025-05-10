import * as api from '../API_Const.js';
import * as simPong from '../Simulation/SimPong.js';

/*const AllSessionsPong = [];
export function AllSesPong_Add(userL, userR)
{
	console.log("++++ Session Pong ++++");
	AllSessionsPong.push(new SessionPong(userL, userR));
}
export function AllSesPongs_Update()
{
	//console.log("Session Count", AllSessionsPong.length);
	for (var i = 0; i < AllSessionsPong.length; i++)
	{
		AllSessionsPong[i].Update();
		if (AllSessionsPong[i].isGameOver)
		{
			console.log("---- Session Pong ----");
			AllSessionsPong.splice(i, i + 1);
			i--;
		}
	}
}*/

export class SessionPong
{
	isGameOver;

	UserL;
	UserR;

	ScoreL;
	ScoreR;

	Sim;

	constructor(userL, userR)
	{
		this.isGameOver = false;

		this.UserL = userL;
		this.UserR = userR;

		this.SendTextAll(api.SESSION_Start);

		this.SendTextAll(api.API_SES_ID + '0');
		this.SendTextAll(api.API_SES_State + 'none');

		this.SendTextAll(api.API_SES_L_ID + this.UserL.DB_User.id);
		this.SendTextAll(api.API_SES_L_Name + this.UserL.DB_User.UserName);
		this.SendTextAll(api.API_SES_L_State + 'none');

		this.SendTextAll(api.API_SES_R_ID + this.UserR.DB_User.id);
		this.SendTextAll(api.API_SES_R_Name + this.UserR.DB_User.UserName);
		this.SendTextAll(api.API_SES_R_State + 'none');

		this.ScoreL = 0;
		this.ScoreR = 0;
		this.SendScoreAll();

		this.Sim = new simPong.SimPong(this);
	}

	GameOver()
	{
		this.isGameOver = true;
		this.SendTextAll(api.SESSION_End);
	}

	SendTextAll(text)
	{
		if (this.UserL.ID == this.UserR.ID)
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

	Update()
	{
		if (this.isGameOver)
		{
			return;
		}

		if (this.UserL.DisConnect || this.UserR.DisConnect)
		{
			this.GameOver();
			return;
		}

		this.Sim.Update();

		if (this.ScoreL >= 3 || this.ScoreR >= 3)
		{
			this.SendTextAll(api.API_SES_State + "Game Over");
			var l = api.API_SES_L_State;
			var r = api.API_SES_R_State;
			if (this.ScoreL > this.ScoreR)
			{
				l += "winner";
				r += "loser";
			}
			else if (this.ScoreL < this.ScoreR)
			{
				l += "loser";
				r += "winner";
			}
			else
			{
				l += "tie";
				r += "tie";
			}
			this.SendTextAll(l);
			this.SendTextAll(r);
			this.GameOver();
		}
	}





	static AllSessionsPong = [];
	static All_Add(userL, userR)
	{
		console.log("++++ Session Pong ++++");
		this.AllSessionsPong.push(new SessionPong(userL, userR));
	}
	static All_Update()
	{
		//console.log("Session Count", AllSessionsPong.length);
		for (var i = 0; i < this.AllSessionsPong.length; i++)
		{
			this.AllSessionsPong[i].Update();
			if (this.AllSessionsPong[i].isGameOver)
			{
				console.log("---- Session Pong ----");
				this.AllSessionsPong.splice(i, i + 1);
				i--;
			}
		}
	}
	
}
