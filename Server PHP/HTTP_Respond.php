
<?php

/*function ResponseCodeToString($fcode)
{
	if ($fcode == 200) { return "OK"; }
	if ($fcode == 400) { return "Bad Request"; }
	if ($fcode == 404) { return "Not Found"; }
	return "Unknown";
}*/
function Respond101($fsocket, $faccept)
{
	$header = "";
	$header .= "HTTP/1.1 101 Switching Protocols\r\n";
	$header .= "Upgrade: websocket\r\n";
	$header .= "Connection: Upgrade\r\n";
	$header .= "Sec-WebSocket-Accept: $faccept\r\n";
	$header .= "\r\n";
	Log::ToFile($header);
	if (canSend($fsocket))
		socket_write($fsocket, $header);
}
function Respond200($fsocket, $ftype, $fbody)
{
	$header = "";
	$header .= "HTTP/1.1 200 OK\r\n";
	if ($ftype != null)
		$header .= "Content-Type: " . $ftype . "\r\n";
	$header .= "\r\n";
	Log::ToFile($header);
	$header .= $fbody;
	if (canSend($fsocket))
		socket_write($fsocket, $header);
}
function Respond200File($fsocket, $ftype, $fpath)
{
	$header = "";
	$header .= "HTTP/1.1 200 OK\r\n";
	if ($ftype != null)
		$header .= "Content-Type: " . $ftype . "\r\n";
	$header .= "\r\n";
	Log::ToFile($header);
	if (canSend($fsocket))
	{
		socket_write($fsocket, $header);
		socket_write($fsocket, file_get_contents($fpath));
	}
}
function Respond400($fsocket)
{
	$header = "";
	$header .= "HTTP/1.1 400 Bad Request\r\n";
	$header .= "\r\n";
	Log::ToFile($header);
	if (canSend($fsocket))
		socket_write($fsocket, $header);
}
function Respond404($fsocket)
{
	$header = "";
	$header .= "HTTP/1.1 404 Not Found\r\n";
	$header .= "\r\n";
	Log::ToFile($header);
	if (canSend($fsocket))
		socket_write($fsocket, $header);
}
function Respond500($fsocket)
{
	$header = "";
	$header .= "HTTP/1.1 500 Internal Server Error\r\n";
	$header .= "\r\n";
	Log::ToFile($header);
	if (canSend($fsocket))
		socket_write($fsocket, $header);
}

?>
