
<?php

class SimulationPong
{
	const WallTickness = 0.05;
	const PaddleSpeedAccel = 0.001;
	const PaddleSpeedLimit = 0.02;

	private $Session;

	private $frameTicker;
	private $frameTime;

	private $LimitBox;
	private $Wall0;
	private $Wall1;
	private $Wall2;
	private $Wall3;

	private $Ball;
	
	private $PaddleL;
	private $PaddleL_UP;
	private $PaddleL_DW;

	function __construct($session)
	{
		$this->Session = $session;

		//	1.000	=	1s		1/s
		//	0.100	=	0.1s	10/s
		//	0.050	=	0.05s	20/s
		//	0.025	=	0.025s	40/s
		//$this->frameTicker = new TimeCheck(1);
		//$this->frameTicker = new TimeCheck(0.25);
		//$this->frameTicker = new TimeCheck(0.1);
		$this->frameTicker = new TimeCheck(0.025);
		$this->frameTime = hrtime(true);

		$this->LimitBox = new Box(new Point(-1.0, -0.5), new Point(+1.0, +0.5));

		$this->Wall0 = new Box(new Point(+1.0 - self::WallTickness, -0.5), new Point(+1.0, +0.5));
		$this->Wall1 = new Box(new Point(-1.0, -0.5), new Point(-1.0 + self::WallTickness, +0.5));
		$this->Wall2 = new Box(new Point(-1.0, +0.5  -self::WallTickness), new Point(+1.0, +0.5));
		$this->Wall3 = new Box(new Point(-1.0, -0.5), new Point(+1.0, -0.5 + self::WallTickness));

		$this->Ball = new VelBox(new Box(new Point(-0.01, -0.01), new Point(+0.01, +0.01)), new Point(0.01, 0.005));

		$this->PaddleL = new Paddle(-0.8, 0.01, 0.1, self::PaddleSpeedAccel, self::PaddleSpeedLimit);
		$this->PaddleL_UP = false;
		$this->PaddleL_DW = false;

		$this->SendFunc("Wall0", $this->Wall0->ToJSON());
		$this->SendFunc("Wall1", $this->Wall1->ToJSON());
		$this->SendFunc("Wall2", $this->Wall2->ToJSON());
		$this->SendFunc("Wall3", $this->Wall3->ToJSON());

		$this->SendFunc("Ball", $this->Ball->ToJSON());
		$this->SendFunc("PaddleL", $this->PaddleL->ToJSON());
	}

	function SendFunc($name, $data)
	{
		$this->Session->SendSimData($name, $data);
	}

	function ShowFrameTime()
	{
		$t = hrtime(true);
		echo "Frame-Time: (should/is): "
			. $this->frameTicker->ToString()
			. "/"
			. (($t - $this->frameTime) / 1000000000) . "s"
			. "\n";
		$this->frameTime = $t;
	}

	function Update()
	{
		if ($this->frameTicker->check())
		{
			if ($this->Wall0->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->X = -abs($this->Ball->Vel->X);
				//echo "-X\n";
			}
			if ($this->Wall1->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->X = +abs($this->Ball->Vel->X);
				//echo "+X\n";
			}
			if ($this->Wall2->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->Y = -abs($this->Ball->Vel->Y);
				//echo "-Y\n";
			}
			if ($this->Wall3->Intersect($this->Ball->Box))
			{
				$this->Ball->Vel->Y = +abs($this->Ball->Vel->Y);
				//echo "+Y\n";
			}

			$this->Ball->Move();
			$this->Ball->Move();

			$this->SendFunc("Ball", $this->Ball->ToJSON());
			$this->SendFunc("PaddleL", $this->PaddleL->ToJSON());
		}
	}
}

?>
