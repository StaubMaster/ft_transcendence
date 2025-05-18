import * as ticker from './TimeTicker.js';

export class TimeCountDown
{
	TimeTicker;
	TickLength;
	TickCount;

	TickRemaining;

	lastUpdateWasTick;
	isDone;

	constructor(tickLength, tickCount)
	{
		this.TimeTicker = new ticker.TimeTicker(tickLength);
		this.TickLength = tickLength;
		this.TickCount = tickCount;
		this.TickRemaining = this.TickCount;
		this.lastUpdateWasTick = false;
		this.isDone = false;
	}

	update()
	{
		this.lastUpdateWasTick = this.TimeTicker.check();
		if (this.lastUpdateWasTick)
		{
			this.TickRemaining--;
			if (this.TickRemaining == 0)
			{
				this.isDone = true;
			}
		}
	}
}
