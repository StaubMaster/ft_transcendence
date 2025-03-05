
<?php

class PresanceCheck
{
	private $Session;
	private $plL;
	private $plR;

	public $isDone;
	public $isFailed;

	private	$TimeSecTick;
	private	$TimeSeconds;

	function __construct($session, $plL, $plR)
	{
		$this->Session = $session;
		$this->plL = $plL;
		$this->plR = $plR;

		$this->isDone = false;
		$this->isFailed = false;

		$this->PresentCheckTime = new TimeCheck(1);
		$this->PresentCheckTimeSec = 10;

		$this->plL->isPresent = false;
		$this->plR->isPresent = false;

		$this->Session->SendAllPlayers(SessionPong::Header_SessionState . "Waiting for Presance");
		$this->Session->SendAllPlayers(SessionPong::Header_SessionLState . "...");
		$this->Session->SendAllPlayers(SessionPong::Header_SessionRState . "...");
	}

	public function Presance()
	{
		if (!$this->plL->isPresent || !$this->plR->isPresent)
		{
			$this->isDone = true;
			$this->isFailed = true;
			$this->Session->SendAllPlayers(SessionPong::Header_SessionState . "Presance Check Failed");
			$l = SessionPong::Header_SessionLState;
			$r = SessionPong::Header_SessionRState;
			if ($this->plL->isPresent) { $l .= "was here"; } else { $l .= "wasn't here"; }
			if ($this->plR->isPresent) { $r .= "was here"; } else { $r .= "wasn't here"; }
			$this->Session->SendAllPlayers($l);
			$this->Session->SendAllPlayers($r);
			return true;
		}
		return false;
	}
	public function Connected()
	{
		if ($this->plL->isRemove() || $this->plR->isRemove())
		{
			$this->isDone = true;
			$this->isFailed = true;
			$this->Session->SendAllPlayers(self::Header_SessionState . "Disconnection");
			$l = SessionPong::Header_SessionLState;
			$r = SessionPong::Header_SessionRState;
			if ($this->plL->isRemove()) { $l .= "disconnected"; } else { $l .= "default"; }
			if ($this->plR->isRemove()) { $r .= "disconnected"; } else { $r .= "default"; }
			$this->Session->SendAllPlayers($l);
			$this->Session->SendAllPlayers($r);
			return true;
		}
		return false;
	}

	public function WaitUpdate()
	{
		if (!$this->PresentCheckTime->check())
		{
			if ($this->plL->isRemove())
			{
				$this->WaitFinal();
			}
			if ($this->plR->isRemove())
			{
				$this->WaitFinal();
			}

			if ($this->plL->isPresent && $this->plR->isPresent)
			{
				$this->WaitFinal();
			}
		}
		else if ($this->PresentCheckTimeSec > 0)
		{
			echo "Present Check: " . $this->PresentCheckTimeSec . "\n";

			if ($this->plL->isPresent)
				$this->Session->SendAllPlayers(SessionPong::Header_SessionLState . "here");

			if ($this->plR->isPresent)
				$this->Session->SendAllPlayers(SessionPong::Header_SessionRState . "here");

			$this->Session->SendAllPlayers(SessionPong::Header_SessionState . "Waiting for Presance " . $this->PresentCheckTimeSec . "s");
			$this->PresentCheckTimeSec--;
		}
		else
		{
			$this->WaitFinal();
		}
	}

	public function WaitFinal()
	{
		$this->isDone = true;

		if ($this->Presance())
		{
			return;
		}

		echo "Present Check: Done\n";
		$this->Session->SendAllPlayers(SessionPong::Header_SessionState . "Playing");
		$this->Session->SendAllPlayers(SessionPong::Header_SessionLState . "");
		$this->Session->SendAllPlayers(SessionPong::Header_SessionRState . "");
	}
};

?>
