
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

	public function ToJSON()
	{
		//return "{ "
		//	. '"x": ' . $this->X . ", "
		//	. '"y": ' . $this->Y . " }";
		return "{ "
			. '"x": ' . number_format($this->X, 4) . ", "
			. '"y": ' . number_format($this->Y, 4) . " }";
	}
}

?>
