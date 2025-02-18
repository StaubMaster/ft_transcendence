
ws = null;

function test_func1()
{
	console.log("test 1");
	if (ws == null)
	{
		ws = new WebSocket("ws");
		ws.binaryType = "arraybuffer";
		ws.onerror = (event) => { console.log("socket error: ", event); };
		ws.onclose = (event) => { console.log("socket closed:" + event.code + ":" + event.reason); ws = null; };
		//ws.onopen = function() { ws.send("hello"); };
		ws.onopen = function() 
		{
			ws.send(
`The length of the "Payload data", in bytes: if 0-125, that is the
payload length.  If 126, the following 2 bytes interpreted as a
16-bit unsigned integer are the payload length.  If 127, the
following 8 bytes interpreted as a 64-bit unsigned integer (the
most significant bit MUST be 0) are the payload length.  Multibyte
length quantities are expressed in network byte order.  Note that
in all cases, the minimal number of bytes MUST be used to encode
the length, for example, the length of a 124-byte-long string
can't be encoded as the sequence 126, 0, 124.  The payload length
is the length of the "Extension data" + the length of the
"Application data".  The length of the "Extension data" may be
zero, in which case the payload length is the length of the
"Application data".`
);
		};
		ws.onmessage = function(e) { console.log("message '" + e.data + "'"); };
	}
}

function test_func2()
{
	console.log("test 2");
	if (ws != null)
	{
		ws.send("test 123");
	}
}

function test_func3()
{
	console.log("test 3");
	if (ws != null)
	{
		ws.send("goodbye");
		ws.close();
	}
}
