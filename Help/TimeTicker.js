
export function timeNs()
{
	var hrTime = process.hrtime();
	return (hrTime[0] * 1000000000 + hrTime[1]);
}

export class TimeTicker
{
	timeToWaitUnit;
	timeToWaitNano;
	timeStamp;

	constructor(timeToWaitSeconds)
	{
		this.timeToWaitUnit = timeToWaitSeconds;
		this.timeToWaitNano = timeToWaitSeconds * 1000000000;
		this.timeStamp = timeNs();
	}

	reset()
	{
		this.timeStamp = timeNs();
	}

	check()
	{
		var t = timeNs();
		if (t - this.timeStamp > this.timeToWaitNano)
		{
			this.timeStamp = timeNs();
			return true;
		}
		return false;
	}

	ToString()
	{
		return this.timeToWaitUnit + "s";
	}
}
