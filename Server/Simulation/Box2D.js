import { Point2D } from './Point2D.js';

export class Box2D
{
	Min;
	Max;

	constructor(min, max)
	{
		this.Min = min;
		this.Max = max;
	}
	static Centered(pos, size_half)
	{
		return new Box2D(
			new Point2D(pos.X - size_half.X, pos.Y - size_half.Y),
			new Point2D(pos.X + size_half.X, pos.Y + size_half.Y)
		);
	}

	ToJSON()
	{
		return "{ "
			+ '"min": ' + this.Min.ToJSON() + ", "
			+ '"max": ' + this.Max.ToJSON() +
			" }";
	}

	GetSizeFull()
	{
		return new Point2D(
			(this.Max.X - this.Min.X),
			(this.Max.Y - this.Min.Y)
		);
	}
	GetSizeHalf()
	{
		return new Point2D(
			(this.Max.X - this.Min.X) * 0.5,
			(this.Max.Y - this.Min.Y) * 0.5
		);
	}

	GetCenter()
	{
		return new Point2D(
			(this.Max.X + this.Min.X) * 0.5,
			(this.Max.Y + this.Min.Y) * 0.5
		);
	}
	SetCenter(center)
	{
		var size = this.GetSizeHalf();

		this.Min.X = center.X - size.X;
		this.Min.Y = center.Y - size.Y;

		this.Max.X = center.X + size.X;
		this.Max.Y = center.Y + size.Y;
	}

	Intersect(other)
	{
		return	(this.Min.X < other.Max.X) &&
				(this.Max.X > other.Min.X) &&
				(this.Min.Y < other.Max.Y) &&
				(this.Max.Y > other.Min.Y);
	}

	/*
		moves this so it fits inside limitBox
		limitBox should be big enought to fit this
		else undefined ?
	*/
	Limit(limitBox)
	{
		var size = this.GetSizeFull();

		if (this.Min.X < limitBox.Min.X)
		{
			this.Min.X = limitBox.Min.X;
			this.Max.X = limitBox.Min.X + size.X;
		}
		if (this.Max.X > limitBox.Max.X)
		{
			this.Min.X = limitBox.Max.X - size.X;
			this.Max.X = limitBox.Max.X;
		}

		if (this.Min.Y < limitBox.Min.Y)
		{
			this.Min.Y = limitBox.Min.Y;
			this.Max.Y = limitBox.Min.Y + size.Y;
		}
		if (this.Max.Y > limitBox.Max.Y)
		{
			this.Min.Y = limitBox.Max.Y - size.Y;
			this.Max.Y = limitBox.Max.Y;
		}
	}
}
