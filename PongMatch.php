
<?php

class PongMatch
{
	function __construct($wsL, $wsR)
	{
		$this->wsL = $wsL;
		$this->wsR = $wsR;

		$this->frameTickTime = 0;
		$this->ScoreL = 0;
		$this->ScoreR = 0;
		$this->isGameOver = false;
	}

	public function isGameOver() { $this->isGameOver; }
	public function ScoreL() { $this->ScoreL; }
	public function ScoreR() { $this->ScoreR; }

	function ClientRecv()
	{
		//	recieve from Client and update Position
		//	keep recieving until no more

	}
	function ClientSend()
	{
		
	}

	function checkSpecialGameOver($l, $r)
	{
		if ($l == false || $r == false)
		{
			$this->isGameOver = true;
			if ($l == false)
				$this->ScoreL = -1;
			if ($r == false)
				$this->ScoreR = -1;
		}
	}

	function checkPlayerPrenence()
	{
		$timeStamp = hrtime(true);

		$PresentL = false;
		$PresentR = false;

		$sec = 10;
		$this->wsL->sendText("getReady: " . $sec);
		$this->wsR->sendText("getReady: " . $sec);

		//	wait 10s for both Players to give Input
		$t = hrtime(true);
		while ($t - $timeStamp < 10000000000)
		{
			if ($this->wsL->isClose())
				break;
			if ($this->wsR->isClose())
				break;

			if ($this->wsL->canRecv())
				$PresentL = true;
			if ($this->wsR->canRecv())
				$PresentR = true;

			if ($PresentL && $PresentR)
				break;

			$t = hrtime(true);
		}

		//	check or disconnect
		checkSpecialGameOver($this->wsL->isClose(), $this->wsR->isClose());

		//	check Present
		checkSpecialGameOver($PresentL, $PresentR);

		$this->frameTickTime = hrtime(true);
	}

	function update()
	{
		//	1 000 000 000		1s		1/s
		//	  100 000 000		0.1s	10/s
		//	   50 000 000		0.05s	20/s
		//	   25 000 000		0.025s	40/s
		$time = hrtime(true);
		if ($time - $this->frameTickTime > 25000000)
		{
			echo "tick\n";

			//	check or disconnect
			checkSpecialGameOver($this->wsL->isClose(), $this->wsR->isClose());
			if ($this->isGameOver)
				return;

			

			$this->frameTickTime = hrtime(true);
		}
	}
}

?>
