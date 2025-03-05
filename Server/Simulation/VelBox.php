
<?php

class VelBox
{
	public $Box;
	public $Vel;

	public function __construct($box, $vel)
	{
		$this->Box = $box;
		$this->Vel = $vel;
	}

	public function ToJSON()
	{
		return "{ "
			. '"box": ' . $this->Box->ToJSON() . ", "
			. '"vel": ' . $this->Vel->ToJSON() .
			" }";
	}

	public function Move()
	{
		$this->Box->Min->X += $this->Vel->X;
		$this->Box->Min->Y += $this->Vel->Y;
		$this->Box->Max->X += $this->Vel->X;
		$this->Box->Max->Y += $this->Vel->Y;
	}
}

?>

