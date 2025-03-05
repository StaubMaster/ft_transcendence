
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

	private $PresanceCheck;
	private $Simulation;

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

		$this->PresanceCheck = new PresanceCheck($this, $this->plL, $this->plR);
		$this->Simulation = null;
	}
	function removePlayers()
	{
		$this->plL->leaveGame();
		$this->plR->leaveGame();
	}

	public function isGameOver() { return $this->isGameOver; }
	public function ScoreL() { return $this->ScoreL; }
	public function ScoreR() { return $this->ScoreR; }
	public function SendAllPlayers($text)
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
	public function SendSimData($name, $data)
	{
		$this->SendAllPlayers('Simulation-Data: { "name": "' . $name . '", "data": ' . $data . ' }');
	}

	public function Update()
	{
		if ($this->isGameOver)
			return;

		$this->plL->Update();
		$this->plR->Update();

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
	}
}

?>
