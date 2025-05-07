import { Point2D } from './Point2D.js';
import { Box2D } from './Box2D.js';

export class VelBox2D
{
	Box;
	Vel;

	constructor(box, vel)
	{
		this.Box = box;
		this.Vel = vel;
	}

	ToJSON()
	{
		return "{ "
			+ '"box": ' + this.Box.ToJSON() + ", "
			+ '"vel": ' + this.Vel.ToJSON() +
			" }";
	}

	Move()
	{
		this.Box.Min.X += this.Vel.X;
		this.Box.Min.Y += this.Vel.Y;
		this.Box.Max.X += this.Vel.X;
		this.Box.Max.Y += this.Vel.Y;
	}
}
