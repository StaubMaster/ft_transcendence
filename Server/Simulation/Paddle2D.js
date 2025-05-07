import { Point2D } from './Point2D.js';
import { Box2D } from './Box2D.js';
import { VelBox2D } from './VelBox2D.js';

export class Paddle2D
{
	MoveUP;
	MoveDW;

	VelBox;

	SpeedAccel;
	SpeedLimit;

	isServing;

	constructor(x, sizeX, sizeY, speedAccel, speedLimit)
	{
		this.MoveUP = false;
		this.MoveDW = false;

		this.VelBox = new VelBox2D(
			new Box2D(
				new Point2D(x - sizeX, -sizeY),
				new Point2D(x + sizeX, +sizeY)
			), new Point2D(0, 0)
		);

		this.SpeedAccel = speedAccel;
		this.SpeedLimit = speedLimit;

		this.isServing = false;
	}

	ToJSON()
	{
		return this.VelBox.ToJSON();
	}

	Intersect(other)
	{
		return this.VelBox.Box.Intersect(other);
	}

	GetCenter()
	{
		return this.VelBox.Box.GetCenter();
	}
	GetVel()
	{
		return this.VelBox.Vel;
	}

	Update(moveUP, moveDW)
	{
		if (moveUP)
		{
			this.VelBox.Vel.Y += this.SpeedAccel;
		}
		else if (this.VelBox.Vel.Y > 0)
		{
			this.VelBox.Vel.Y -= this.SpeedAccel;
		}

		if (moveDW)
		{
			this.VelBox.Vel.Y -= this.SpeedAccel;
		}
		else if (this.VelBox.Vel.Y < 0)
		{
			this.VelBox.Vel.Y += this.SpeedAccel;
		}
	}

	LimitVel()
	{
		//	Limit Max Speed
		if (this.VelBox.Vel.Y > +this.SpeedLimit) { this.VelBox.Vel.Y = +this.SpeedLimit; }
		if (this.VelBox.Vel.Y < -this.SpeedLimit) { this.VelBox.Vel.Y = -this.SpeedLimit; }

		//	Limit Min Speed
		if (Math.abs(this.VelBox.Vel.Y) < this.SpeedAccel) { this.VelBox.Vel.Y = 0; }
	}
	LimitBox(limitBox)
	{
		this.VelBox.Box.Limit(limitBox);
	}

	Move()
	{
		this.VelBox.Move();
	}
}
