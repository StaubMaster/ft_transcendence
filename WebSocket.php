
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

	public function recv($socket)
	{
		if (($buf = socket_read($socket, 2, PHP_BINARY_READ)) === false)
		{
			echo "socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
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
				echo "Len16\n";
				echo "socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
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
				echo "Len64\n";
				echo "socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
			}
	
			$this->payload_len = 0;
			for ($i = 0; $i < 8; $i++)
			{
				$byte = ord($buf[$i]);
				$this->payload_len = ($this->payload_len << 8) | $byte;
			}
		}
	
		if (($buf = socket_read($socket, 4, PHP_BINARY_READ)) === false)
		{
			echo "Mask\n";
			echo "socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
		}
		
		$mask_arr = array(0, 0, 0, 0);
		for ($i = 0; $i < 4; $i++)
		{
			$mask_arr[$i] = ord($buf[$i]);
		}
	
		if (($buf = socket_read($socket, $this->payload_len, PHP_BINARY_READ)) === false)
		{
			echo "payload\n";
			echo "socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
		}

		for ($i = 0; $i < $this->payload_len; $i++)
		{
			$byte = ord($buf[$i]);
			$byte = ($byte ^ $mask_arr[$i % 4]);
			$buf[$i] = chr($byte);
		}

		$this->payload_str = $buf;
	}
	public function send($socket)
	{
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

	public function canRecv()
	{
		if ($this->isClose)
			return false;

		$r = array($this->socket);
		$w = null;
		$e = null;
		if (($num = socket_select($r, $w, $e, 0, 0)) === false)
		{
			//echo "socket_select(): " . socket_strerror(socket_last_error($client_socket)) . "\n";
		}
		else
		{
			if ($num != 0)
				return true;
		}
		return false;
	}

	public function recvText()
	{
		if ($this->isClose)
			return null;

		$frame = new Frame();
		$frame->recv($this->socket);
		if ($frame->getOpenCode() == Frame::OpenCode_TextFrame)
		{
			return $frame->getPayload();
		}
		if ($frame->getOpenCode() == Frame::OpenCode_ConnectionClose)
		{
			$this->close();
		}
		return null;
	}
	public function sendText($payload)
	{
		if ($this->isClose)
			return;

		$frame = new Frame();
		$frame->setOpenCode(Frame::OpenCode_TextFrame);
		$frame->setPayload($payload);
		$frame->send($this->socket);
	}
}

?>
