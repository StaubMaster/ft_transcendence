
<?php

class Paddle
{
	private $VelBox;

	private $SpeedAccel;
	private $SpeedLimit;

	function __construct($x, $sizeX, $sizeY, $speedAccel, $speedLimit)
	{
		$this->VelBox = new VelBox(new Box(new Point($x - $sizeX, -$sizeY), new Point($x + $sizeX, +$sizeY)), new Point(0, 0));

		$this->SpeedAccel = $speedAccel;
		$this->SpeedLimit = $speedLimit;
	}

	public function ToJSON()
	{
		return $this->VelBox->ToJSON();
	}

	function Input($up, $dw)
	{
		if ($up)
		{
			$this->VelBox->Vel->Y += $this->SpeedAccel;
		}
		else if ($this->VelBox->Vel->Y > 0)
		{
			$this->VelBox->Vel->Y -= $this->SpeedAccel;
		}

		if ($dw)
		{
			$this->VelBox->Vel->Y -= $this->SpeedAccel;
		}
		else if ($this->VelBox->Vel->Y > 0)
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
