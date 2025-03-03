
<?php

class SessionPong
{
	const Header_SessionID = "Session-ID: ";
	const Header_SessionState = "Session-State: ";

	const Header_SessionLID = "Session-L-ID: ";
	const Header_SessionLName = "Session-L-Name: ";
	const Header_SessionLScore = "Session-L-Score: ";
	const Header_SessionLState = "Session-L-State: ";

	const Header_SessionRID = "Session-R-ID: ";
	const Header_SessionRName = "Session-R-Name: ";
	const Header_SessionRScore = "Session-R-Score: ";
	const Header_SessionRState = "Session-R-State: ";

	private $plL;
	private $plR;

	private $ScoreL;
	private $ScoreR;

	private $isGameOver;

	private $frameTicker;
	private $frameTime;

	function __construct($plL, $plR)
	{
		$this->plL = $plL;
		$this->plR = $plR;
		$this->plL->joinGame(0);
		$this->plR->joinGame(0);

		$this->SendAllPlayers(self::Header_SessionID . "0");
		$this->SendAllPlayers(self::Header_SessionState . "none");
		$this->SendAllPlayers(self::Header_SessionLID . $this->plL->getID());
		$this->SendAllPlayers(self::Header_SessionRID . $this->plR->getID());
		$this->SendAllPlayers(self::Header_SessionLName . $this->plL->getName());
		$this->SendAllPlayers(self::Header_SessionRName . $this->plR->getName());
		$this->SendAllPlayers(self::Header_SessionLState . "none");
		$this->SendAllPlayers(self::Header_SessionRState . "none");

		$this->ScoreL = 0;
		$this->ScoreR = 0;
		$this->SendScore();

		$this->isGameOver = false;

		//	1.000	=	1s		1/s
		//	0.100	=	0.1s	10/s
		//	0.050	=	0.05s	20/s
		//	0.025	=	0.025s	40/s
		//$this->frameTicker = new TimeCheck(1);
		//$this->frameTicker = new TimeCheck(0.25);
		//$this->frameTicker = new TimeCheck(0.1);
		$this->frameTicker = new TimeCheck(0.025);
		$this->frameTime = hrtime(true);

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
	private function SendAllPlayers($text)
	{
		if ($this->plL->getID() != $this->plR->getID())
		{
			$this->plL->sendText($text);
			$this->plR->sendText($text);
		}
		else
		{
			$this->plL->sendText($text);
		}
	}
	private function SendScore()
	{
		$this->SendAllPlayers(self::Header_SessionLScore . $this->ScoreL);
		$this->SendAllPlayers(self::Header_SessionRScore . $this->ScoreR);
	}
	private function SendSessionData($name, $data)
	{
		$this->SendAllPlayers('Session-Data: { "name": "' . $name . '", "data": ' . $data . ' }');
	}

	function checkPlayersPresance()
	{
		if (!$this->plL->isPresent || !$this->plR->isPresent)
		{
			$this->isGameOver = true;
			$this->SendScore();
			$this->SendAllPlayers(self::Header_SessionState . "Presance Check Failed");
			$l = self::Header_SessionLState;
			$r = self::Header_SessionRState;
			if ($this->plL->isPresent) { $l .= "was here"; } else { $l .= "wasn't here"; }
			if ($this->plR->isPresent) { $r .= "was here"; } else { $r .= "wasn't here"; }
			$this->SendAllPlayers($l);
			$this->SendAllPlayers($r);
			return true;
		}
		return false;
	}
	function checkPlayersConnected()
	{
		if ($this->plL->isRemove() || $this->plR->isRemove())
		{
			$this->isGameOver = true;
			$this->SendScore();
			$this->SendAllPlayers(self::Header_SessionState . "Disconnection");
			$l = self::Header_SessionLState;
			$r = self::Header_SessionRState;
			if ($this->plL->isRemove()) { $l .= "disconnected"; } else { $l .= "default"; }
			if ($this->plR->isRemove()) { $r .= "disconnected"; } else { $r .= "default"; }
			$this->SendAllPlayers($l);
			$this->SendAllPlayers($r);
			return true;
		}
		return false;
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

	/*
		i want the session to give more info to each player
		at start of session:
		- session ID
		- username and ID of each User
		Presance check:
		- is Happaning
		- waiting for you / other (put this at the end of usernames ?)
		Session Simulation:
		- Score
		Session End:
		- Score (put with username ?)
		- Who Won (put with username ?)
		- Why it Ended
			- someone wasn't present (put with username ?)
			- someone disconnected (put with Username ?)
			- someone lost

		with all this stuff for the usernames, I could just make a Scoreboard
		the problem with this is that it might be a lot of information during the game
		maybe during the game you have big numbers for the score
		and the rest of the data is below
		that is the only information you get in the original pong

		but most of this info is only ever once important so show all at once would be stupid
		- when the Session start show the username and ID
		- during the Presance Check the valid info is: "not here" "here", thats kind of it
		- during the Session the info is maybe the score
		- after the Session in info is score followed by: "won" "lost" "disconnected" "default"

		Session-ID: 0
		Session-State: "checking Presance"
		Session-L-Name: 0 "UserName"
		Session-R-Name: 1 "CoolerUserName"
		Session-L-State: "lost"
		Session-R-State: "won"
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
		$this->SendAllPlayers(self::Header_SessionState . "Waiting for Presance");
		$this->SendAllPlayers(self::Header_SessionLState . "...");
		$this->SendAllPlayers(self::Header_SessionRState . "...");
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

			if ($this->plL->isPresent)
				$this->SendAllPlayers(self::Header_SessionLState . "here");

			if ($this->plR->isPresent)
				$this->SendAllPlayers(self::Header_SessionRState . "here");

			$this->SendAllPlayers(self::Header_SessionState . "Waiting for Presance " . $this->PresentCheckTimeSec . "s");
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

		if ($this->checkPlayersPresance())
		{
			return;
		}

		echo "Present Check: Done\n";
		$this->SendAllPlayers(self::Header_SessionState . "Playing");
		$this->SendAllPlayers(self::Header_SessionLState . "");
		$this->SendAllPlayers(self::Header_SessionRState . "");

		$this->SendSessionData("Wall0", $this->Wall0->toString());
		$this->SendSessionData("Wall1", $this->Wall1->toString());
		$this->SendSessionData("Wall2", $this->Wall2->toString());
		$this->SendSessionData("Wall3", $this->Wall3->toString());
	}


	public $Wall0;
	public $Wall1;
	public $Wall2;
	public $Wall3;
	public $Ball;
	public function InitBoxes()
	{
		$this->Wall0 = new Box(new Point(+0.9, -1.0), new Point(+1.0, +1.0));
		$this->Wall1 = new Box(new Point(-1.0, -1.0), new Point(-0.9, +1.0));
		$this->Wall2 = new Box(new Point(-1.0, +0.9), new Point(+1.0, +1.0));
		$this->Wall3 = new Box(new Point(-1.0, -1.0), new Point(+1.0, -0.9));

		$this->Ball = new VelBox(new Box(new Point(-0.025, -0.025), new Point(+0.025, +0.025)), new Point(0.02, 0.01));
	}


	public function Update()
	{
		if ($this->isGameOver)
			return;

		$this->plL->Update();
		$this->plR->Update();

		if ($this->checkPlayersConnected())
			return;

		if ($this->PresentChecking)
		{
			$this->PresentCheckWaitUpdate();
			return;
		}

		if ($this->frameTicker->check())
		{
			//$t = hrtime(true);
			//echo "Frame-Time: (should/is): "
			//	. $this->frameTicker->ToString()
			//	. "/"
			//	. (($t - $this->frameTime) / 1000000000) . "s"
			//	. "\n";
			//$this->frameTime = $t;

			if ($this->Wall0->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->X = -abs($this->Ball->Vel->X);
				//echo "-X\n";
			}
			if ($this->Wall1->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->X = +abs($this->Ball->Vel->X);
				//echo "+X\n";
			}
			if ($this->Wall2->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->Y = -abs($this->Ball->Vel->Y);
				//echo "-Y\n";
			}
			if ($this->Wall3->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->Y = +abs($this->Ball->Vel->Y);
				//echo "+Y\n";
			}

			$this->Ball->Move();
			$this->SendSessionData("Ball", $this->Ball->toString());
		}
	}
}

?>
