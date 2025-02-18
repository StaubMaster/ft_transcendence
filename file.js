
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
		ws.onopen = function() { ws.send("hello"); };
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
