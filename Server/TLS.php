
<?php

function read_uint_n($socket, $len)
{
	if (($buf = socket_read($socket, $len, PHP_BINARY_READ)) === false)
	{
		echo "read_simple(): socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
	}
	$len = strlen($buf);
	$arr = array();
	for ($i = 0; $i < $len; $i++)
	{
		$arr[$i] = ord($buf[$i]);
	}
	return $arr;
}
function read_uint_8($socket)
{
	if (($buf = socket_read($socket, 1, PHP_NORMAL_READ)) === false)
	{
		echo "read_simple(): socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
	}
	return ord($buf[0]);
}
function read_uint_16($socket)
{
	if (($buf = socket_read($socket, 2, PHP_NORMAL_READ)) === false)
	{
		echo "read_simple(): socket_read(): " . socket_strerror(socket_last_error($socket)) . "\n";
	}
	$val = 0;
	$val |= ord($buf[0]) << 8;
	$val |= ord($buf[1]);
	return $val;
}

function buf_to_uint_n($buf, $start, $len)
{
	$val = 0;
	for ($i = 0; $i < $len; $i++)
	{
		$val = ($val << 8) | ($buf[$start + $i]);
	}
	return $val;
}
function buf_to_arr_n($buf, $start, $len)
{
	$arr = array();
	for ($i = 0; $i < $len; $i++)
	{
		$arr[$i] = $buf[$start + $i];
	}
	return $arr;
}


function test_TLS($socket)
{
	sleep(3);
	//	5.1	Record Layer
	//	ContentType

	$ContentType = read_uint_8($socket);
	echo "ContentType: $ContentType\n";
	//	22: handshake

	$ProtocolVersion = read_uint_16($socket);
	echo "ProtocolVersion: 0x" . dechex($ProtocolVersion) . "\n";
	//	MUST be 0x0303
	//	for ClientHello it MAY be 0x0301

	$length = read_uint_16($socket);
	echo "length: $length\n";
	//	MUST NOT be larger than 16384

	$fragment = read_uint_n($socket, $length);

	if ($ContentType != 22)
	{
		echo "!!!! ContentType: not Implemented\n";
	}
	else
	{
		$HandshakeType = $fragment[0];
		echo "HandshakeType: $HandshakeType\n";

		$length = buf_to_uint_n($fragment, 1, 3);
		echo "length: $length\n";

		if ($HandshakeType != 1)
		{
			echo "!!!! HandshakeType: not Implemented\n";
		}
		else
		{
			$idx = 4;

			echo "idx $idx;\n";
			$ProtocolVersion = buf_to_uint_n($fragment, $idx, 2);
			echo "ProtocolVersion: 0x" . dechex($ProtocolVersion) . "\n";
			//	MUST be 0x0303
			$idx += 2;

			//	Random[32]
			echo "Random:\n";
			for ($i = 0; $i < 32; $i++)
			{
				echo "" . strval($fragment[$idx + $i]) . " ";
			}
			echo "\n;\n";
			$idx += 32;

			echo "idx $idx;\n";
			$legacy_session_id_len = buf_to_uint_n($fragment, $idx, 1);
			$idx += 1;
			$legacy_session_id = buf_to_arr_n($fragment, $idx, $legacy_session_id_len);
			$idx += $legacy_session_id_len;

			echo "legacy_session_id: $legacy_session_id_len:\n";
			for ($i = 0; $i < $legacy_session_id_len; $i++)
			{
				echo "" . $legacy_session_id[$i] . " ";
			}
			echo "\n;\n";

			echo "idx $idx;\n";
			$cipher_suites_len = buf_to_uint_n($fragment, $idx, 2);
			$idx += 2;
			$cipher_suites = buf_to_arr_n($fragment, $idx, $cipher_suites_len);
			$idx += $cipher_suites_len;

			echo "cipher_suites: $cipher_suites_len:\n";
			for ($i = 0; $i < $cipher_suites_len; $i += 2)
			{
				echo "(" . $cipher_suites[$i + 0] . "|" . $cipher_suites[$i + 1] . ") ";
			}
			echo "\n;\n";

			echo "idx $idx;\n";
			$legacy_compression_methods_len = buf_to_uint_n($fragment, $idx, 1);
			$idx += 1;
			$legacy_compression_methods = buf_to_arr_n($fragment, $idx, $legacy_compression_methods_len);
			$idx += $legacy_compression_methods_len;

			echo "legacy_compression_methods: $legacy_compression_methods_len:\n";
			for ($i = 0; $i < $legacy_compression_methods_len; $i++)
			{
				echo "" . $legacy_compression_methods[$i] . " ";
			}
			echo "\n;\n";

			echo "idx $idx;\n";
			$extensions_len = buf_to_uint_n($fragment, $idx, 2);
			$idx += 2;
			$extensions = buf_to_arr_n($fragment, $idx, $extensions_len);
			$idx += $extensions_len;

			echo "extensions: $extensions_len:\n";
			for ($i = 0; $i < $extensions_len; $i++)
			{
				echo "" . $extensions[$i] . " ";
			}
			echo "\n;\n";

			echo "idx $idx;\n";
			echo "length $length;\n";
		}
	}
}

?>
