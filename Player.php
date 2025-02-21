
<?php

class CPlayer
{
	private static $GlobalID = 0;

	private $ws;
	private $ID;

	private $GameID;

	public function __construct($ws)
	{
		$this->ws = $ws;

		$this->ID = self::$GlobalID;
		$this->ws->sendText("ID: " . self::$GlobalID);
		self::$GlobalID++;

		$this->GameID = -1;
	}

	public function isRemove()
	{
		return $this->ws->isClose();
	}
	public function getID()
	{
		return $this->ID;
	}

	public function leaveGame()
	{
		$this->ws->sendText("LeftGame: " . $this->GameID);
		$this->GameID = -1;
	}
	public function joinGame($gameID)
	{
		$this->GameID = $gameID;
		$this->ws->sendText("JoinedGame: " . $this->GameID);
		return $this->ws;
	}

	public function Update()
	{
		$this->ws->checkConnectionUpdate();

		if ($this->GameID != -1)
			return;

		if (($message = $this->ws->recvText()) !== false)
		{
			$CmdInviteRecv = new Command("InviteRequestTo: ");
			if (($val = $CmdInviteRecv->value($message)) !== false)
			{
				$pl = PlayersGetID($val);
				if ($pl == null)
				{
					$this->ws->sendText("IDNotFound: " . $val);
				}
				else
				{
					$pl->ws->sendText("InviteRequestFrom: " . $this->ID);
					PongMatchesAdd($this->ID, $pl->getID());
				}
			}
			else
			{
				echo "recv ---> '$message'\n";
				$message = "unknown";
				echo "send <--- '$message'\n";
				$this->ws->sendText($message);
			}
		}
	}
}

?>
