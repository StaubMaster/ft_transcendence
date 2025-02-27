
<?php

class SessionPong
{
	private $plL;
	private $plR;

	private $ScoreL;
	private $ScoreR;

	private $isGameOver;

	function __construct($plL, $plR)
	{
		$this->plL = $plL;
		$this->plR = $plR;
		$this->plL->joinGame(0);
		$this->plR->joinGame(0);
		$this->plL->sendText("Playing-With: " . $this->plR->getID());
		$this->plR->sendText("Playing-With: " . $this->plL->getID());

		//$this->frameTickTime = 0;
		$this->ScoreL = 0;
		$this->ScoreR = 0;
		$this->isGameOver = false;

		$this->InitBoxes();
	}
	function removePlayers()
	{
		$this->plL->leaveGame();
		$this->plR->leaveGame();
	}

	public function isGameOver() { return $this->isGameOver; }
	public function ScoreL() { return $this->ScoreL; }
	public function ScoreR() { return $this->ScoreR; }

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
	public function PresentCheckWait()
	{
		$this->PresentChecking = true;
		$this->PresentCheckTime = new TimeCheck(1);
		$this->PresentCheckTimeSec = 10;
		$this->plL->isPresent = false;
		$this->plR->isPresent = false;
	}
	public function PresentCheckWaitUpdate()
	{
		if (!$this->PresentCheckTime->check())
		{
			if ($this->plL->isRemove())
			{
				$this->PresentCheckFinal();
			}
			if ($this->plR->isRemove())
			{
				$this->PresentCheckFinal();
			}

			if ($this->plL->isPresent && $this->plR->isPresent)
			{
				$this->PresentCheckFinal();
			}
		}
		else if ($this->PresentCheckTimeSec > 0)
		{
			echo "Present Check: " . $this->PresentCheckTimeSec . "\n";
			if (!$this->plL->isPresent)
				$this->plL->sendText("Presance-Check: " . $this->PresentCheckTimeSec);
			if (!$this->plR->isPresent)
				$this->plR->sendText("Presance-Check: " . $this->PresentCheckTimeSec);
			$this->PresentCheckTimeSec--;
		}
		else
		{
			$this->PresentCheckFinal();
		}
	}
	public function PresentCheckFinal()
	{
		$this->PresentChecking = false;

		//	check or disconnect
		$this->checkSpecialGameOver(!$this->plL->isRemove(), !$this->plR->isRemove());

		//	check Present
		$this->checkSpecialGameOver($this->plL->isPresent, $this->plR->isPresent);

		echo "Present Check: Done\n";
		$this->plL->sendText("Presance-Check: Done");
		$this->plR->sendText("Presance-Check: Done");
	}


	public $Wall0;
	public $Wall1;
	public $Wall2;
	public $Wall3;
	public $Ball;
	public function InitBoxes()
	{
		$this->Wall0 = new Box(new Point(+9, +9), new Point(+10, +10));
		$this->Wall1 = new Box(new Point(-10, +9), new Point(-9, +10));
		$this->Wall2 = new Box(new Point(+9, -10), new Point(+10, -9));
		$this->Wall3 = new Box(new Point(-10, -10), new Point(-9, -9));
		$this->Ball = new VelBox(new Box(new Point(1, 2), new Point(3, 3)), new Point(0.01, 0.02));
	}


	private $debug = true;
	public function Update()
	{
		$this->plL->Update();
		$this->plR->Update();

		$this->checkSpecialGameOver(!$this->plL->isRemove(), !$this->plR->isRemove());
		if ($this->isGameOver)
		{
			return;
		}

		if ($this->PresentChecking)
		{
			$this->PresentCheckWaitUpdate();
			return;
		}

		/*if (!$this->PresentChecking && $this->debug)
		{
			$this->debug = false;
			if ($this->isGameOver) { echo "isGameOver: true\n"; } else { echo "isGameOver: false\n"; }
			echo "isGameOver: " . $this->isGameOver . "\n";
			echo "ScoreL: " . $this->ScoreL . "\n";
			echo "ScoreR: " . $this->ScoreR . "\n";
			echo "PresentL: " . $this->plL->isPresent . "\n";
			echo "PresentR: " . $this->plR->isPresent . "\n";
		}*/

		$this->Ball->Move();
		$ball_data = "Ball-Data: " . $this->Ball->toString();
		$this->plL->sendText($ball_data);
		$this->plR->sendText($ball_data);

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
