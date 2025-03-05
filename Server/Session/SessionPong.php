
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

	private $userL;
	private $userR;

	public $ScoreL;
	public $ScoreR;

	private $isGameOver;

	private $PresanceCheck;

	private $Simulation;

	function __construct($userL, $userR)
	{
		$this->userL = $userL;
		$this->userR = $userR;

		$this->SendAll(self::Header_SessionID . "0");
		$this->SendAll(self::Header_SessionState . "none");
		$this->SendAll(self::Header_SessionLID . $this->userL->getID());
		$this->SendAll(self::Header_SessionRID . $this->userR->getID());
		$this->SendAll(self::Header_SessionLName . $this->userL->getName());
		$this->SendAll(self::Header_SessionRName . $this->userR->getName());
		$this->SendAll(self::Header_SessionLState . "none");
		$this->SendAll(self::Header_SessionRState . "none");

		$this->ScoreL = 0;
		$this->ScoreR = 0;
		$this->SendScore();

		$this->isGameOver = false;

		$this->PresanceCheck = new PresanceCheck($this, $this->userL, $this->userR);
		$this->Simulation = null;
	}
	function removeUsersPaddle()
	{
		$this->userL->setPaddle(null);
		$this->userR->setPaddle(null);
	}

	public function isGameOver() { return $this->isGameOver; }
	public function SendAll($text)
	{
		if ($this->userL->getID() != $this->userR->getID())
		{
			$this->userL->sendText($text);
			$this->userR->sendText($text);
		}
		else
		{
			$this->userL->sendText($text);
		}
	}
	public function SendScore()
	{
		$this->SendAll(self::Header_SessionLScore . $this->ScoreL);
		$this->SendAll(self::Header_SessionRScore . $this->ScoreR);
	}
	public function SendSimData($name, $data)
	{
		$this->SendAll('Simulation-Data: { "name": "' . $name . '", "data": ' . $data . ' }');
	}
	public function getUserL()
	{
		return $this->userL;
	}
	public function getUserR()
	{
		return $this->userR;
	}

	public function Update()
	{
		if ($this->isGameOver)
			return;

		$this->userL->Update();
		$this->userR->Update();

		if ($this->PresanceCheck->Connected())
		{
			return;
		}

		if ($this->PresanceCheck->isFailed)
		{
			$this->isGameOver = true;
			return;
		}
		if (!$this->PresanceCheck->isDone)
		{
			$this->PresanceCheck->WaitUpdate();
			if ($this->PresanceCheck->isDone && !$this->PresanceCheck->isFailed)
			{
				$this->Simulation = new SimulationPong($this);
			}
			return;
		}

		$this->Simulation->Update();

		if ($this->ScoreL >= 3 || $this->ScoreR >= 3)
		{
			$this->isGameOver = true;
			$this->SendAll(SessionPong::Header_SessionState . "Game Over");
			$l = SessionPong::Header_SessionLState;
			$r = SessionPong::Header_SessionRState;
			if ($this->ScoreL > $this->ScoreR)
			{
				$l .= "winner";
				$r .= "loser";
			}
			else if ($this->ScoreL < $this->ScoreR)
			{
				$l .= "loser";
				$r .= "winner";
			}
			else
			{
				$l .= "tie";
				$r .= "tie";
			}
			$this->SendAll($l);
			$this->SendAll($r);
		}
	}
}

?>
