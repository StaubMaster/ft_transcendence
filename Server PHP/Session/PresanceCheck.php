
<?php

class PresanceCheck
{
	private $Session;
	private $userL;
	private $userR;

	public $isDone;
	public $isFailed;

	private	$TimeSecTick;
	private	$TimeSeconds;

	function __construct($session, $userL, $userR)
	{
		$this->Session = $session;
		$this->userL = $userL;
		$this->userR = $userR;

		$this->isDone = false;
		$this->isFailed = false;

		$this->PresentCheckTime = new TimeCheck(1);
		$this->PresentCheckTimeSec = 10;

		$this->userL->isPresent = false;
		$this->userR->isPresent = false;

		$this->Session->SendAll(SessionPong::Header_SessionState . "Waiting for Presance");
		$this->Session->SendAll(SessionPong::Header_SessionLState . "...");
		$this->Session->SendAll(SessionPong::Header_SessionRState . "...");
	}

	public function Presance()
	{
		if (!$this->userL->isPresent || !$this->userR->isPresent)
		{
			$this->isDone = true;
			$this->isFailed = true;
			$this->Session->SendAll(SessionPong::Header_SessionState . "Presance Check Failed");
			$l = SessionPong::Header_SessionLState;
			$r = SessionPong::Header_SessionRState;
			if ($this->userL->isPresent) { $l .= "was here"; } else { $l .= "wasn't here"; }
			if ($this->userR->isPresent) { $r .= "was here"; } else { $r .= "wasn't here"; }
			$this->Session->SendAll($l);
			$this->Session->SendAll($r);
			return true;
		}
		return false;
	}
	public function Connected()
	{
		if ($this->userL->isRemove() || $this->userR->isRemove())
		{
			$this->isDone = true;
			$this->isFailed = true;
			$this->Session->SendAll(SessionPong::Header_SessionState . "Disconnection");
			$l = SessionPong::Header_SessionLState;
			$r = SessionPong::Header_SessionRState;
			if ($this->userL->isRemove()) { $l .= "disconnected"; } else { $l .= "default"; }
			if ($this->userR->isRemove()) { $r .= "disconnected"; } else { $r .= "default"; }
			$this->Session->SendAll($l);
			$this->Session->SendAll($r);
			return true;
		}
		return false;
	}

	public function WaitUpdate()
	{
		if (!$this->PresentCheckTime->check())
		{
			if ($this->userL->isRemove())
			{
				$this->WaitFinal();
			}
			if ($this->userR->isRemove())
			{
				$this->WaitFinal();
			}

			if ($this->userL->isPresent && $this->userR->isPresent)
			{
				$this->WaitFinal();
			}
		}
		else if ($this->PresentCheckTimeSec > 0)
		{
			echo "Present Check: " . $this->PresentCheckTimeSec . "\n";

			if ($this->userL->isPresent)
				$this->Session->SendAll(SessionPong::Header_SessionLState . "here");

			if ($this->userR->isPresent)
				$this->Session->SendAll(SessionPong::Header_SessionRState . "here");

			$this->Session->SendAll(SessionPong::Header_SessionState . "Waiting for Presance " . $this->PresentCheckTimeSec . "s");
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
		$this->Session->SendAll(SessionPong::Header_SessionState . "Playing");
		$this->Session->SendAll(SessionPong::Header_SessionLState . "");
		$this->Session->SendAll(SessionPong::Header_SessionRState . "");
	}
};

?>
