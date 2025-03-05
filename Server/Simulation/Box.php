
<?php

class Box
{
	public $Min;
	public $Max;

	public function __construct($min, $max)
	{
		$this->Min = $min;
		$this->Max = $max;
	}
	public static function Centered($pos, $size_half)
	{
		return new Box(
			new Point($pos.X - $size_half.X, $pos.Y - $size_half.Y),
			new Point($pos.X + $size_half.X, $pos.Y + $size_half.Y)
		);
	}

	public function ToJSON()
	{
		return "{ "
			. '"min": ' . $this->Min->ToJSON() . ", "
			. '"max": ' . $this->Max->ToJSON() .
			" }";
	}

	public function GetCenter()
	{
		return new Point(
			($this->Max->X + $this->Min->X) * 0.5,
			($this->Max->Y + $this->Min->Y) * 0.5
		);
	}
	public function GetSizeFull()
	{
		return new Point(
			($this->Max->X - $this->Min->X),
			($this->Max->Y - $this->Min->Y)
		);
	}
	public function GetSizeHalf()
	{
		return new Point(
			($this->Max->X - $this->Min->X) * 0.5,
			($this->Max->Y - $this->Min->Y) * 0.5
		);
	}
	public function SetCenter($center)
	{
		$size = $this->GetSizeHalf();

		$this->Min->X = $center->X - $size->X;
		$this->Min->Y = $center->Y - $size->Y;

		$this->Max->X = $center->X + $size->X;
		$this->Max->Y = $center->Y + $size->Y;
	}

	public function Intersect($other)
	{
		return	($this->Min->X < $other->Max->X) &&
				($this->Max->X > $other->Min->X) &&
				($this->Min->Y < $other->Max->Y) &&
				($this->Max->Y > $other->Min->Y);
	}

	/*
		moves $this so it fits inside $limitBox
		$limitBox should be big enought to fit $this
		else undefined ?
	*/
	public function Limit($limitBox)
	{
		$size = $this->GetSizeFull();

		if ($this->Min->X < $limitBox->Min->X)
		{
			$this->Min->X = $limitBox->Min->X;
			$this->Max->X = $limitBox->Min->X + $size->X;
		}
		if ($this->Max->X > $limitBox->Max->X)
		{
			$this->Min->X = $limitBox->Max->X - $size->X;
			$this->Max->X = $limitBox->Max->X;
		}

		if ($this->Min->Y < $limitBox->Min->Y)
		{
			$this->Min->Y = $limitBox->Min->Y;
			$this->Max->Y = $limitBox->Min->Y + $size->Y;
		}
		if ($this->Max->Y > $limitBox->Max->Y)
		{
			$this->Min->Y = $limitBox->Max->Y - $size->Y;
			$this->Max->Y = $limitBox->Max->Y;
		}
	}
}

?>
