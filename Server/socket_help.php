
<?php

function socket_server_create($faddress, $fport)
{
	//echo "socket_create()\n";
	if (($fserver_socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false)
	{
		echo "socket_create(): " . socket_strerror(socket_last_error()) . "\n";
		return false;
	}

	//echo "socket_set_nonblock()\n";
	if (socket_set_nonblock($fserver_socket) === false)
	{
		echo "socket_set_nonblock(): " . socket_strerror(socket_last_error($fserver_socket)) . "\n";
		return false;
	}

	//echo "socket_bind()\n";
	if (socket_bind($fserver_socket, $faddress, $fport) === false)
	{
		echo "socket_bind(): " . socket_strerror(socket_last_error($fserver_socket)) . "\n";
		return false;
	}

	//echo "socket_listen()\n";
	if (socket_listen($fserver_socket, 5) === false)
	{
		echo "socket_listen(): " . socket_strerror(socket_last_error($fserver_socket)) . "\n";
		return false;
	}

	return $fserver_socket;
}

function socket_server_accept($fserver_socket)
{
	if (($fclient_socket = socket_accept($fserver_socket)) === false)
	{
		$err_code = socket_last_error($fserver_socket);
		if ($err_code != 0)
		{
			echo "socket_accept(): " . socket_strerror($err_code) . "\n";
			return false;
		}
		return null;
	}
	return $fclient_socket;
}

function socket_client_read_header($fclient_socket)
{
	if (socket_set_nonblock($fclient_socket) === false)
	{
		echo "socket_set_nonblock(): " . socket_strerror(socket_last_error($fclient_socket)) . "\n";
	}

	//echo "loop <--\n";
	$timeCheck = new TimeCheck(1);

	$msg = "";
	do
	{
		if ($timeCheck->check())
		{
			echo "==== read TimeOut afer " . $timeCheck->toString() . " ====\n";
			echo "<<<<\n$msg\n>>>>\n";
			return null;
		}

		if (!canRecv($fclient_socket))
		{
			//echo "nothing to read\n";
			continue;
		}

		//echo "read\n";
		if (($buf = socket_read($fclient_socket, 256, PHP_NORMAL_READ)) === false)
		{
			echo "socket_read(): " . socket_strerror(socket_last_error($fclient_socket)) . "\n";
			break;
		}
		//echo "here 1\n";
		if ($buf != null)
		{
			//echo "spam '" . $buf . "':" . strlen($buf) . ":" . $len . "\n";
		}
		//echo "here 2\n";
		if ($buf == "")
		{
			//echo "END of Message\n";
			break;
		}
		//echo "here 3\n";
		$msg .= $buf;

		//echo "<<<<<<<<$buf>>>>>>>>\n";

		if (strlen($msg) > 4)
		{
			$last4 = substr($msg, strlen($msg) - 4);
			if ($last4 == "\r\n\r\n")
			{
				//echo "end of Header\n";
				break;
			}
		}
	} while (true);
	//echo "loop -->\n";
	return $msg;
}

function canRecv($fsocket)
{
	$r = array($fsocket);
	$w = null;
	$e = null;
	if (($num = socket_select($r, $w, $e, 0, 0)) === false)
	{
		echo "canRecv(): " . socket_strerror(socket_last_error($fsocket)) . "\n";
		return false;
	}
	else
	{
		if ($num != 0)
			return true;
	}
	return false;
}
function canSend($fsocket)
{
	$r = null;
	$w = array($fsocket);
	$e = null;
	if (($num = socket_select($r, $w, $e, 0, 0)) === false)
	{
		echo "canSend(): " . socket_strerror(socket_last_error($fsocket)) . "\n";
		return false;
	}
	else
	{
		if ($num != 0)
			return true;
	}
	return false;
}



/*function str_starts_with($str, $match)
{
	return substr($str, 0, strlen($match)) === $match;
}

function str_ends_with($str, $match)
{
	return substr($str, -strlen($match)) === $match;
}

function str_contains($str, $match)
{
	return strpos($str, $match) !== false;
}*/

?>
