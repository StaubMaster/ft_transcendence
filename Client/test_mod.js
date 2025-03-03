
export function BallFunc(str)
{
	console.log("'" + str + "'");
	var data = JSON.parse(str);
	console.log(data);
}
window.BallFunc = BallFunc;

