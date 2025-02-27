
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

	public function toString()
	{
		return $this->Min->toString() . " " . $this->Max->toString();
	}

	public static function Intersect($other)
	{
		return	($this->Min.X < $other->Max.X) &&
				($this->Max.X > $other->Min.X) &&
				($this->Min.Y < $other->Max.Y) &&
				($this->Max.Y > $other->Min.Y);
	}
}

?>
