
export class Point2D
{
	X;
	Y;

	constructor(x, y)
	{
		this.X = x; this.Y = y;
	}

	ToJSON()
	{
		return "{ "
			+ '"x": ' + this.X + ", "
			+ '"y": ' + this.Y + " }";
		//return "{ "
		//	+ '"x": ' + number_format(this.X, 4) + ", "
		//	+ '"y": ' + number_format(this.Y, 4) + " }";
	}
}
