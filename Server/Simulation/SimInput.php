
<?php

class SimInput
{
	public	$isUP;
	public	$isDW;

	function __construct()
	{
		$this->isUP = false;
		$this->isDW = false;
	}

	public function update($val)
	{
		if ($val == "UP") { $this->isUP = true; }
		if ($val == "DW") { $this->isDW = true; }
		if ($val == "!UP") { $this->isUP = false; }
		if ($val == "!DW") { $this->isDW = false; }
	}
}

?>
