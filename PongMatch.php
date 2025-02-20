
<?php

class PongMatch
{
	private $wsL;
	private $wsR;

	private $ScoreL;
	private $ScoreR;
	private $isGameOver;

	function __construct($wsL, $wsR)
	{
		$this->wsL = $wsL;
		$this->wsR = $wsR;

		//$this->frameTickTime = 0;
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



	/*
		right now this is a bit too fast
		the websocket onOpen() sends only after this
		so the last ws will immediatly be recognized as here
		but for manual connections there would be some time between these
		but still fix these maybe,
		like only recognize certain messages
		but then the problem is that a message might be consumed here or the other check
		so add something to remember the last message and give that when it was "refunded"
	*/
	private $PresentChecking;
	private $PresentCheckTime;
	private $PresentCheckTimeSec;
	private $PresentL;
	private $PresentR;
	public function PresentCheckWait()
	{
		$this->PresentChecking = true;
		$this->PresentCheckTime = new TimeCheck(1);
		$this->PresentCheckTimeSec = 10;
		$this->PresentL = false;
		$this->PresentR = false;
	}
	public function PresentCheckWaitUpdate()
	{
		if (!$this->PresentCheckTime->check())
		{
			if ($this->wsL->isClose())
			{
				$this->PresentCheck();
			}
			if ($this->wsR->isClose())
			{
				$this->PresentCheck();
			}

			if (($message = $this->wsL->recvText()) !== false)
			{
				$this->wsL->sendText("Presance-Check: Here");
				$this->PresentL = true;
			}
			if (($message = $this->wsR->recvText()) !== false)
			{
				$this->wsR->sendText("Presance-Check: Here");
				$this->PresentR = true;
			}

			/*if ($this->PresentR = true && $this->PresentR = true)
			{
				$this->PresentCheckingDone = false;
			}*/
		}
		else if ($this->PresentCheckTimeSec > 0)
		{
			echo "Present Check: " . $this->PresentCheckTimeSec . "\n";
			$this->wsL->sendText("Presance-Check: " . $this->PresentCheckTimeSec);
			$this->wsR->sendText("Presance-Check: " . $this->PresentCheckTimeSec);
			$this->PresentCheckTimeSec--;
		}
		else
		{
			echo "Present Check: Done\n";
			$this->wsL->sendText("Presance-Check: Done");
			$this->wsR->sendText("Presance-Check: Done");
			$this->PresentCheck();
		}
	}
	public function PresentCheck()
	{
		$this->PresentChecking = false;

		//	check or disconnect
		$this->checkSpecialGameOver(!$this->wsL->isClose(), !$this->wsR->isClose());

		//	check Present
		$this->checkSpecialGameOver($this->PresentL, $this->PresentR);
	}

	private $debug = true;
	public function Update()
	{
		if ($this->PresentChecking)
		{
			$this->PresentCheckWaitUpdate();
		}

		if (!$this->PresentChecking && $this->debug)
		{
			$this->debug = false;
			if ($this->isGameOver) { echo "isGameOver: true\n"; } else { echo "isGameOver: false\n"; }
			echo "isGameOver: " . $this->isGameOver . "\n";
			echo "ScoreL: " . $this->ScoreL . "\n";
			echo "ScoreR: " . $this->ScoreR . "\n";
			echo "PresentL: " . $this->PresentL . "\n";
			echo "PresentR: " . $this->PresentR . "\n";
		}

		/*
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
		}*/
	}
}

?>
