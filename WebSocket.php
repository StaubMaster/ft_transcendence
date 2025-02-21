
<?php

class Frame
{
	const OpenCode_ContinuationFrame  = 0x0;
	const OpenCode_TextFrame          = 0x1;
	const OpenCode_BinaryFrame        = 0x2;
	#ReservedNonControl = 0x3
	#ReservedNonControl = 0x4
	#ReservedNonControl = 0x5
	#ReservedNonControl = 0x6
	#ReservedNonControl = 0x7
	const OpenCode_ConnectionClose    = 0x8;
	const OpenCode_Ping               = 0x9;
	const OpenCode_Pong               = 0xA;
	#ReservedControl    = 0xB
	#ReservedControl    = 0xC
	#ReservedControl    = 0xD
	#ReservedControl    = 0xE
	#ReservedControl    = 0xF

	private $error = false;

	private $fin = 1;
	private $rsv = 0;
	private $code;

	private $mask_bit = 0;
	private $mask_arr = null;

	private $payload_len = 0;
	private $payload_str = null;

	public function setOpenCode($code)
	{
		$this->code = $code;
	}
	public function getOpenCode()
	{
		return $this->code;
	}

	public function setPayload($payload)
	{
		$this->payload_str = $payload;
	}
	public function getPayload()
	{
		return $this->payload_str;
	}

	public function checkError()
	{
		return $this->error;
	}

	public function recv($socket)
	{
		if (($buf = socket_read($socket, 2, PHP_BINARY_READ)) === false)
		{
			$errCode = socket_last_error($socket);
			$this->error = "Header:" . $errCode . ":" . socket_strerror($errCode);
			return;
		}

		$byte = ord($buf[0]);
		$this->fin  = $byte & 0b10000000;
		$this->rsv  = $byte & 0b01110000;
		$this->code = $byte & 0b00001111;

		$byte = ord($buf[1]);
		$this->mask_bit    = $byte & 0b10000000;
		$this->payload_len = $byte & 0b01111111;

		if ($this->payload_len == 126)
		{
			if (($buf = socket_read($socket, 2, PHP_BINARY_READ)) === false)
			{
				$errCode = socket_last_error($socket);
				$this->error = "Len16:" . $errCode . ":" . socket_strerror($errCode);
				return;
			}

			$this->payload_len = 0;
			for ($i = 0; $i < 2; $i++)
			{
				$byte = ord($buf[$i]);
				$this->payload_len = ($this->payload_len << 8) | $byte;
			}
		}
		elseif ($this->payload_len == 127)
		{
			if (($buf = socket_read($socket, 8, PHP_BINARY_READ)) === false)
			{
				$errCode = socket_last_error($socket);
				$this->error = "Len64:" . $errCode . ":" . socket_strerror($errCode);
				return;
			}

			$this->payload_len = 0;
			for ($i = 0; $i < 8; $i++)
			{
				$byte = ord($buf[$i]);
				$this->payload_len = ($this->payload_len << 8) | $byte;
			}
		}

		$this->mask_arr = array(0, 0, 0, 0);
		if ($this->mask_bit != 0)
		{
			if (($buf = socket_read($socket, 4, PHP_BINARY_READ)) === false)
			{
				$errCode = socket_last_error($socket);
				$this->error = "Mask:" . $errCode . ":" . socket_strerror($errCode);
				return;
			}
			
			for ($i = 0; $i < 4; $i++)
			{
				$this->mask_arr[$i] = ord($buf[$i]);
			}
		}

		if ($this->payload_len != 0)
		{
			if (($buf = socket_read($socket, $this->payload_len, PHP_BINARY_READ)) === false)
			{
				$errCode = socket_last_error($socket);
				$this->error = "Payload:" . $errCode . ":" . socket_strerror($errCode);
				return;
			}

			for ($i = 0; $i < $this->payload_len; $i++)
			{
				$byte = ord($buf[$i]);
				$byte = ($byte ^ $this->mask_arr[$i % 4]);
				$buf[$i] = chr($byte);
			}

			$this->payload_str = $buf;
		}
	}

	public function send($socket)
	{
		if ($this->payload_str != null)
			$this->payload_len = strlen($this->payload_str);

		$buf = "";

		$byte = 0;
		$byte |= $this->fin << 7;
		$byte |= $this->rsv << 4;
		$byte |= $this->code;
		$buf .= chr($byte);
		
		$byte = 0;
		$byte |= $this->mask_bit << 7;
		if ($this->payload_len > 0xFFFF)
		{
			$byte |= 127;
			$buf .= chr($byte);
			
			$len = $this->payload_len;
			for ($i = 0; $i < 4; $i++)
			{
				$byte = chr($len >> 24);
				$buf .= chr($byte);
				$len = $len << 8;
			}
		}
		elseif ($this->payload_len > 0x7F)
		{
			$byte |= 126;
			$buf .= chr($byte);
			
			$len = $this->payload_len;
			for ($i = 0; $i < 2; $i++)
			{
				$byte = chr($len >> 8);
				$buf .= chr($byte);
				$len = $len << 8;
			}
		}
		else
		{
			$byte |= $this->payload_len;
			$buf .= chr($byte);
		}

		if ($this->payload_len != 0)
			$buf .= $this->payload_str;

		socket_write($socket, $buf);
	}
}

class WebSocket
{
	public static function HandShake($fkey)
	{
		$faccept = $fkey . "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
		$faccept = sha1($faccept, true);
		$faccept = base64_encode($faccept);
		return $faccept;
	}

	private $socket;
	private $isClose;

	function __construct($sock)
	{
		$this->socket = $sock;
		$this->isClose = false;
	}

	public function isClose()
	{
		return $this->isClose;
	}
	public function close()
	{
		$this->isClose = true;
		socket_close($this->socket);
	}

	//	return Text Message if one was recieved, otherwise returns null
	//	needs to be called regularly to check for pong
	public function recvText()
	{
		if ($this->isClose)
			return false;

		if (!canRecv($this->socket))
			return false;

		$frame = new Frame();
		$frame->recv($this->socket);

		if (($err = $frame->checkError()) !== false)
		{
			echo "Error: " . $err . "\n";
			return false;
		}

		if ($frame->getOpenCode() == Frame::OpenCode_TextFrame)
		{
			return $frame->getPayload();
		}
		elseif ($frame->getOpenCode() == Frame::OpenCode_ConnectionClose)
		{
			echo "==== close ====\n";
			$this->close();
		}
		elseif ($frame->getOpenCode() == Frame::OpenCode_Pong)
		{
			$this->pongRecv();
		}
		else
		{
			echo "openCode:" . $frame->getOpenCode() . ":\n";
		}
		return false;
	}
	public function sendText($payload)
	{
		if ($this->isClose)
			return;

		$frame = new Frame();
		$frame->setOpenCode(Frame::OpenCode_TextFrame);
		$frame->setPayload($payload);
		$frame->send($this->socket);
		if (($err = $frame->checkError()) !== false)
		{
			echo "Error: " . $err . "\n";
		}
	}

	private $PingPongWait;
	private $PingPongLast;
	private function pongRecv()
	{
		//echo "==== pong ====\n";
		$this->PingPongWait = false;
		$this->PingPongLast = hrtime(true);
	}
	private function pingSent()
	{
		//echo "==== ping ====\n";
		$this->PingPongWait = true;
		$this->PingPongLast = hrtime(true);
	}
	public function checkConnectionUpdate()
	{
		if ($this->isClose)
			return;

		if (!$this->PingPongWait)
		{
			$t = hrtime(true);
			if ($t - $this->PingPongLast > 3000000000)	//	3s
			{
				$frame = new Frame();
				$frame->setOpenCode(Frame::OpenCode_Ping);
				$frame->send($this->socket);
				$this->pingSent();
			}
		}
		else
		{
			$t = hrtime(true);
			if ($t - $this->PingPongLast > 3000000000)	//	3s
			{
				echo "!!!! PingPong TimeOut !!!!\n";
				$this->close();
			}
		}
	}
}

?>
