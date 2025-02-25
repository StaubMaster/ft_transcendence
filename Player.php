
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
	public function recvText()
	{
		return $this->ws->recvText();
	}
	public function sendText($text)
	{
		$this->ws->sendText($text);
	}

	public function getID()
	{
		return $this->ID;
	}
	public function getTableUser($id)
	{
		$str = '{';
		$str .= '"ID":' . $this->ID . ',';
		$str .= '"User":"' . 'placeholder' . '",';

		$str .= '"Status":"';
		if ($this->ID == $id)
		{
			$str .= "self";
		}
		else
		{
			$str .= "free";
		}
		$str .= '"';

		return $str . "}";
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
	}

	public $isPresent;

	public function Update()
	{
		$this->ws->checkConnectionUpdate();

		if (($message = $this->ws->recvText()) !== false)
		{
			$CmdInviteRecv = new Command("InviteRequestTo: ");
			$CmdIamHere = new Command("I-Am-Here");
			if (($val = $CmdInviteRecv->value($message)) !== false)
			{
				if ($val == $this->ID)
				{
					$this->ws->sendText("This-is-You: " . $val);
				}
				else
				{
					$pl = PlayersGetID($val);
					if ($pl == null)
					{
						$this->ws->sendText("ID-Not-Found: " . $val);
					}
					else
					{
						$pl->ws->sendText("Invite-Request-From: " . $this->ID);
						PongMatchesAdd($this->ID, $pl->getID());
					}
				}
			}
			elseif (($val = $CmdIamHere->value($message)) !== false)
			{
				$this->isPresent = true;
				$this->ws->sendText("Presance-Check: Here");
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
