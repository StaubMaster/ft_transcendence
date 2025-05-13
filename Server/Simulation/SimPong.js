import * as api from '../../Help/API_Const.js';
import { Point2D } from './Point2D.js';
import { Box2D } from './Box2D.js';
import { VelBox2D } from './VelBox2D.js';
import { Paddle2D } from './Paddle2D.js';
import { TimeTicker, timeNs } from '../../Help/TimeTicker.js';
import { TimeCountDown } from '../../Help/TimeCountDown.js';

const WallTickness = 0.05;
const PaddleSpeedAccel = 0.001;
const PaddleSpeedLimit = 0.02;

export class SimPong
{
	Session;

	TimeStart;
	TimeTickCount;
	TimeFrameTicker;
	TimeFrameMeasure;

	LimitBox;
	Wall0;
	Wall1;
	Wall2;
	Wall3;

	Ball;

	PaddleL;
	PaddleR;

	isServing;
	ServingLorR;
	ServingTimer;

	constructor(session)
	{
		this.Session = session;

		//	1.000	=	1s		1/s
		//	0.100	=	0.1s	10/s
		//	0.050	=	0.05s	20/s
		//	0.025	=	0.025s	40/s
		this.TimeStart = timeNs();
		this.TimeTickCount = 0;
		//this.TimeFrameTicker = new TimeTicker(1);
		this.TimeFrameTicker = new TimeTicker(0.025);
		this.TimeFrameMeasure = timeNs();

		this.LimitBox = new Box2D(new Point2D(-1.0 + WallTickness, -0.5 + WallTickness), new Point2D(+1.0 - WallTickness, +0.5 - WallTickness));

		this.Wall0 = new Box2D(new Point2D(+1.0 - WallTickness, -0.5), new Point2D(+1.0, +0.5));
		this.Wall1 = new Box2D(new Point2D(-1.0, -0.5), new Point2D(-1.0 + WallTickness, +0.5));
		this.Wall2 = new Box2D(new Point2D(-1.0, +0.5 - WallTickness), new Point2D(+1.0, +0.5));
		this.Wall3 = new Box2D(new Point2D(-1.0, -0.5), new Point2D(+1.0, -0.5 + WallTickness));

		this.Ball = new VelBox2D(new Box2D(new Point2D(-0.01, -0.01), new Point2D(+0.01, +0.01)), new Point2D(0.01, 0.005));

		this.PaddleL = new Paddle2D(-0.8, 0.01, 0.1, PaddleSpeedAccel, PaddleSpeedLimit);
		this.PaddleR = new Paddle2D(+0.8, 0.01, 0.1, PaddleSpeedAccel, PaddleSpeedLimit);

		this.isServing = false;

		this.SendFunc(api.SIMULATION_WALL0, this.Wall0.ToJSON());
		this.SendFunc(api.SIMULATION_WALL1, this.Wall1.ToJSON());
		this.SendFunc(api.SIMULATION_WALL2, this.Wall2.ToJSON());
		this.SendFunc(api.SIMULATION_WALL3, this.Wall3.ToJSON());

		this.SendFunc(api.SIMULATION_BALL, this.Ball.ToJSON());
		this.SendFunc(api.SIMULATION_PADDLE_L, this.PaddleL.ToJSON());
		this.SendFunc(api.SIMULATION_PADDLE_R, this.PaddleR.ToJSON());
	}

	SendFunc(name, data)
	{
		this.Session.SendSimData(name, data);
	}

	ShowFrameTime()
	{
		var t = ticker.timeNs();
		console.log("Frame-Time: (should/is): "
			+ this.TimeFrameTicker.ToString()
			+ "/"
			+ ((t - this.TimeFrameMeasure) / 1000000000) + "s"
			);
		this.TimeFrameMeasure = t;
	}
	/*GetTimeStamp()
	{
		str = "";
		str .= ((hrtime(true) - this.TimeStart) / 1000000000) . "s";
		str .= " (";
		str .= this.TimeTickCount . " Ticks";
		str .= ")";
		return str;
	}*/

	ServeBall(lorr)
	{
		this.isServing = true;
		this.ServingLorR = lorr;
		this.ServingTimer = new TimeCountDown(1, 3);
		this.Ball.Vel.X = 0;
		this.Ball.Vel.Y = 0;
	}

	BallWallUpdate()
	{
		if (this.Wall0.Intersect(this.Ball.Box))
		{
			this.Ball.Vel.X = -Math.abs(this.Ball.Vel.X);
			this.Session.ScoreL++;
			this.Session.SendScoreAll();
			this.ServeBall(false);
		}
		if (this.Wall1.Intersect(this.Ball.Box))
		{
			this.Ball.Vel.X = +Math.abs(this.Ball.Vel.X);
			this.Session.ScoreR++;
			this.Session.SendScoreAll();
			this.ServeBall(true);
		}
		if (this.Wall2.Intersect(this.Ball.Box))
		{
			this.Ball.Vel.Y = -Math.abs(this.Ball.Vel.Y);
		}
		if (this.Wall3.Intersect(this.Ball.Box))
		{
			this.Ball.Vel.Y = +Math.abs(this.Ball.Vel.Y);
		}
	}

	Update()
	{
		if (!this.TimeFrameTicker.check())
			return;

		//this.ShowFrameTime();

		if (this.PaddleL.Intersect(this.Ball.Box))
		{
			this.Ball.Vel.X = +Math.abs(this.Ball.Vel.X);
			this.Ball.Vel.Y += this.PaddleL.GetVel().Y * 0.25;
		}
		if (this.PaddleR.Intersect(this.Ball.Box))
		{
			this.Ball.Vel.X = -Math.abs(this.Ball.Vel.X);
			this.Ball.Vel.Y += this.PaddleR.GetVel().Y * 0.25;
		}

		if (this.isServing)
		{
			if (!this.ServingLorR)
			{
				var serve_paddle = this.PaddleL;
				var pos = serve_paddle.GetCenter();
				pos.X += 0.1;
			}
			else
			{
				var serve_paddle = this.PaddleR;
				var pos = serve_paddle.GetCenter();
				pos.X -= 0.1;
			}
			this.Ball.Box.SetCenter(pos);

			this.ServingTimer.update();
			if (this.ServingTimer.lastUpdateWasTick)
			{
				//echo "Serving: " . this.ServingTimer.GetRemaining() . "\n";
			}
			if (this.ServingTimer.isDone)
			{
				this.isServing = false;
				if (!this.ServingLorR)
					this.Ball.Vel.X = +0.01;
				else
					this.Ball.Vel.X = -0.01;
				this.Ball.Vel.Y = serve_paddle.GetVel().Y * 0.25;
			}
		}

		this.BallWallUpdate();

		this.PaddleL.Update(this.Session.UserL.PressUP, this.Session.UserL.PressDW);
		this.PaddleR.Update(this.Session.UserR.PressUP, this.Session.UserR.PressDW);

		this.PaddleL.LimitVel();
		this.PaddleR.LimitVel();

		this.Ball.Move();
		this.PaddleL.Move();
		this.PaddleR.Move();

		this.PaddleL.LimitBox(this.LimitBox);
		this.PaddleR.LimitBox(this.LimitBox);

		this.SendFunc(api.SIMULATION_BALL, this.Ball.ToJSON());
		this.SendFunc(api.SIMULATION_PADDLE_L, this.PaddleL.ToJSON());
		this.SendFunc(api.SIMULATION_PADDLE_R, this.PaddleR.ToJSON());

		this.TimeTickCount++;
	}
}
