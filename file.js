
ws = null;

function test_func1()
{
	if (ws == null)
	{
		ws = new WebSocket("ws");
		ws.binaryType = "arraybuffer";
		ws.onerror = (event) => { console.log("socket error: ", event); };
		ws.onclose = (event) => { console.log("socket closed:" + event.code + ":" + event.reason); ws = null; };
		ws.onopen = function() { ws.send("hello"); };
		/*ws.onopen = function() 
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
		};*/
		ws.onmessage = function(e)
		{
			if (e.data.startsWith("ID: "))
			{
				var cut = e.data.substring("ID: ".length);
				console.log("ID: '" + cut + "'");
				elem = document.getElementById("InviteYourID");
				if (elem != null)
				{
					elem.textContent = "Your ID: " + cut;
				}
			}
			else if (e.data.startsWith("InviteRequestFrom: "))
			{
				var cut = e.data.substring("InviteRequestFrom: ".length);
				console.log("InviteRequestFrom: '" + cut + "'");
			}
			else
			{
				console.log("message '" + e.data + "'");
			}
		};
	}
}

function InviteFunc()
{
	if (ws == null)
		return;
	elem = document.getElementById("InviteOtherID");
	if (elem == null)
		return;
	var invID = elem.value;
	ws.send("InviteRequestTo: " + invID);
}

function AcceptFunc()
{
	if (ws == null)
		return;

}

function test_func2()
{
	console.log("IAmHere");
	if (ws != null)
	{
		ws.send("IAmHere");
	}
}

function test_func3()
{
	console.log("Bye");
	if (ws != null)
	{
		ws.send("Bye");
		ws.close();
	}
}
