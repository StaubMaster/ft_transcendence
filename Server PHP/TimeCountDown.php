
<?php

class TimeCountDown
{
	private $TimeCheck;
	private $TickLength;
	private $TickCount;

	private $TickRemaining;

	private $lastUpdateWasTick;
	private $isDone;

	public function __construct($tickLength, $tickCount)
	{
		$this->TimeCheck = new TimeCheck($tickLength);
		$this->TickLength = $tickLength;
		$this->TickCount = $tickCount;
		$this->TickRemaining = $this->TickCount;
		$this->lastUpdateWasTick = false;
		$this->isDone = false;
	}

	public function check()
	{
		$this->lastUpdateWasTick= $this->TimeCheck->check();
		if ($this->lastUpdateWasTick)
		{
			$this->TickRemaining--;
			if ($this->TickRemaining == 0)
			{
				$this->isDone = true;
			}
		}
	}

	public function WasTick()
	{
		return $this->lastUpdateWasTick;
	}
	public function GetRemaining()
	{
		return $this->TickRemaining;
	}
	public function isDone()
	{
		return $this->isDone;
	}
}

?>
