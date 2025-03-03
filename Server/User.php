
<?php

class CPlayer
{
	private static $GlobalID = 0;

	private $ws;
	private $ID;
	private $Name;

	private $InvitesSendArr;
	private $InvitesRecvArr;

	private $GameID;

	public function __construct($ws)
	{
		$this->ws = $ws;

		$this->ID = self::$GlobalID;
		$this->Name = "<<placeholder>>";
		$this->ws->sendText("ID: " . self::$GlobalID);
		self::$GlobalID++;

		$this->InvitesSendArr = array();
		$this->InvitesRecvArr = array();

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
	public function getName()
	{
		return $this->Name;
	}


	private function InviteSend($other)
	{
		array_push($this->InvitesSendArr, $other->ID);
		$other->InviteRecv($this);
	}
	private function InviteRecv($other)
	{
		array_push($this->InvitesRecvArr, $other->ID);
	}
	private function InviteSendCheck($id)
	{
		foreach ($this->InvitesSendArr as $elem)
		{
			if ($elem == $id) { return true; }
		}
		return false;
	}
	private function InviteRecvCheck($id)
	{
		foreach ($this->InvitesRecvArr as $elem)
		{
			if ($elem == $id) { return true; }
		}
		return false;
	}

	public function getTableUser($id)
	{
		$str = '{';
		$str .= '"ID":' . $this->ID . ',';
		$str .= '"User":"' . $this->Name . '",';

		$str .= '"Status":"';
		if ($this->ID == $id)
		{
			$str .= "this is you";
		}
		else
		{
			$invS = $this->InviteSendCheck($id);
			$invR = $this->InviteRecvCheck($id);
			if ($invS == false && $invR == false)
				$str .= "none";
			else if ($invS == true && $invR == false)
				$str .= "invites you";
			else if ($invS == false && $invR == true)
				$str .= "you invited";
			else
				$str .= "mutual invite";
		}
		$str .= '"';

		return $str . "}";
	}

	public function leaveGame()
	{
		$this->GameID = -1;
	}
	public function joinGame($gameID)
	{
		$this->GameID = $gameID;
	}

	public $isPresent;
	public function Update()
	{
		$this->ws->checkConnectionUpdate();

		if (($message = $this->ws->recvText()) !== false)
		{
			$CmdChangeName = new Command("Change-Name: ");
			$CmdInviteRecv = new Command("InviteRequestTo: ");
			$CmdIamHere = new Command("I-Am-Here");
			if (($val = $CmdChangeName->value($message)) !== false)
			{
				$this->Name = $val;
			}
			else if (($val = $CmdInviteRecv->value($message)) !== false)
			{
				//	Allow Self Invite for Testing
				if ($val == $this->ID)
				{
					$this->ws->sendText("This-is-You: " . $val);
					SessionPongArray_AddByUsers($this, $this);
				}
				else
				{
					$other = UsersArray_GetByID($val);
					if ($other == null)
					{
						$this->ws->sendText("ID-Not-Found: " . $val);
					}
					else
					{
						if ($this->InviteRecvCheck($other->getID()))
						{
							$other->ws->sendText("Invite-Request-From: " . $this->ID);
							SessionPongArray_AddByUsers($this, $other);
						}
						else
						{
							$this->InviteSend($other);
						}
					}
				}
			}
			elseif (($val = $CmdIamHere->value($message)) !== false)
			{
				$this->isPresent = true;
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
