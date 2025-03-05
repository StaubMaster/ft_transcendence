
<?php

class Paddle
{
	private	$MoveUP;
	private	$MoveDW;

	private $VelBox;

	private $SpeedAccel;
	private $SpeedLimit;

	public $isServing;

	function __construct($x, $sizeX, $sizeY, $speedAccel, $speedLimit)
	{
		$this->MoveUP = false;
		$this->MoveDW = false;

		$this->VelBox = new VelBox(new Box(new Point($x - $sizeX, -$sizeY), new Point($x + $sizeX, +$sizeY)), new Point(0, 0));

		$this->SpeedAccel = $speedAccel;
		$this->SpeedLimit = $speedLimit;

		$this->isServing = false;
	}

	public function ToJSON()
	{
		return $this->VelBox->ToJSON();
	}

	function Intersect($other)
	{
		return $this->VelBox->Box->Intersect($other);
	}

	function GetCenter()
	{
		return $this->VelBox->Box->GetCenter();
	}
	function GetVel()
	{
		return $this->VelBox->Vel;
	}

	function InputStr($str)
	{
		if ($str == "UP") { $this->MoveUP = true; }
		if ($str == "DW") { $this->MoveDW = true; }
		if ($str == "!UP") { $this->MoveUP = false; }
		if ($str == "!DW") { $this->MoveDW = false; }
	}
	function UpdateInput()
	{
		if ($this->MoveUP)
		{
			$this->VelBox->Vel->Y += $this->SpeedAccel;
		}
		else if ($this->VelBox->Vel->Y > 0)
		{
			$this->VelBox->Vel->Y -= $this->SpeedAccel;
		}

		if ($this->MoveDW)
		{
			$this->VelBox->Vel->Y -= $this->SpeedAccel;
		}
		else if ($this->VelBox->Vel->Y < 0)
		{
			$this->VelBox->Vel->Y += $this->SpeedAccel;
		}
	}

	function LimitVel()
	{
		//	Limit Max Speed
		if ($this->VelBox->Vel->Y > +$this->SpeedLimit) { $this->VelBox->Vel->Y = +$this->SpeedLimit; }
		if ($this->VelBox->Vel->Y < -$this->SpeedLimit) { $this->VelBox->Vel->Y = -$this->SpeedLimit; }

		//	Limit Min Speed
		if (abs($this->VelBox->Vel->Y) < $this->SpeedAccel) { $this->VelBox->Vel->Y = 0; }
	}
	function LimitBox($limitBox)
	{
		$this->VelBox->Box->Limit($limitBox);
	}

	function Move()
	{
		$this->VelBox->Move();
	}
}

?>
