
<?php

class Point
{
	public $X;
	public $Y;

	public function __construct($x, $y)
	{
		$this->X = $x;
		$this->Y = $y;
	}

	public function toString()
	{
		return $this->X . " " . $this->Y;
	}
}

?>
