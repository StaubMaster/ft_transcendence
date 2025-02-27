
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
		$this->frameTicker = new TimeCheck(1);

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
		$this->plL->sendText($text);
		$this->plR->sendText($text);
	}
	private function SendScore()
	{
		$this->SendAllPlayers(self::Header_SessionLScore . $this->ScoreL);
		$this->SendAllPlayers(self::Header_SessionRScore . $this->ScoreR);

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
	function returnScoreWithText($good, $bad)
	{
		$this->SendScore();

		$l = self::Header_SessionLState;
		if ($this->ScoreL == -1) { $l .= $bad; } else { $l .= $good; }

		$r = self::Header_SessionRState;
		if ($this->ScoreR == -1) { $r .= $bad; } else { $r .= $good; }

		$this->SendAllPlayers($l);
		$this->SendAllPlayers($r);
	}
	function checkPlayersPresance()
	{
		$this->checkSpecialGameOver($this->plL->isPresent, $this->plR->isPresent);
		if ($this->isGameOver)
		{
			$this->SendAllPlayers(self::Header_SessionState . "Presance Check Failed");
			$this->returnScoreWithText("was here", "wasn't here");
			return true;
		}
		return false;
	}
	function checkPlayersConnected()
	{
		$this->checkSpecialGameOver(!$this->plL->isRemove(), !$this->plR->isRemove());
		if ($this->isGameOver)
		{
			$this->SendAllPlayers(self::Header_SessionState . "Disconnection");
			$this->returnScoreWithText("default", "disconnected");
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

		if ($this->frameTicker->check())
		{
			$this->Ball->Move();
			$ball_data = "Ball-Data: " . $this->Ball->toString();
			$this->SendAllPlayers($ball_data);
		}
	}
}

?>
