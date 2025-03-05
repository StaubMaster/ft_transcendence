
<?php

class Paddle
{
	private $SimInput;

	private $VelBox;

	private $SpeedAccel;
	private $SpeedLimit;

	function __construct($x, $sizeX, $sizeY, $speedAccel, $speedLimit)
	{
		$this->SimInput = new SimInput();

		$this->VelBox = new VelBox(new Box(new Point($x - $sizeX, -$sizeY), new Point($x + $sizeX, +$sizeY)), new Point(0, 0));

		$this->SpeedAccel = $speedAccel;
		$this->SpeedLimit = $speedLimit;
	}

	public function ToJSON()
	{
		return $this->VelBox->ToJSON();
	}
	public function setUser($usr)
	{
		$usr->setSimInput($this->SimInput);
	}

	function Intersect($other)
	{
		return $this->VelBox->Box->Intersect($other);
	}

	function UpdateInput()
	{
		if ($this->SimInput->isUP)
		{
			$this->VelBox->Vel->Y += $this->SpeedAccel;
		}
		else if ($this->VelBox->Vel->Y > 0)
		{
			$this->VelBox->Vel->Y -= $this->SpeedAccel;
		}

		if ($this->SimInput->isDW)
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
