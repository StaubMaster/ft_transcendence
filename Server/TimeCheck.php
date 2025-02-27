
<?php

class TimeCheck
{
	private $timeToWaitUnit;
	private $timeToWaitNano;
	private $timeStamp;

	public function __construct($timeToWait)
	{
		$this->timeToWaitUnit = $timeToWait;
		$this->timeToWaitNano = $timeToWait * 1000000000;
		$this->timeStamp = hrtime(true);
	}

	public function reset()
	{
		$this->timeStamp = hrtime(true);
	}

	public function check()
	{
		$t = hrtime(true);
		if ($t - $this->timeStamp > $this->timeToWaitNano)
		{
			$this->timeStamp = hrtime(true);
			return true;
		}
		return false;
	}

	public function toString()
	{
		return $this->timeToWaitUnit . "s";
	}
}

?>
