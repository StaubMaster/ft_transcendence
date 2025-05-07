
<?php

class SimulationPong
{
	const WallTickness = 0.05;
	const PaddleSpeedAccel = 0.001;
	const PaddleSpeedLimit = 0.02;

	private $Session;

	private $TimeStart;
	private $TimeTickCount;
	private $TimeFrameTicker;
	private $TimeFrameMeasure;

	private $LimitBox;
	private $Wall0;
	private $Wall1;
	private $Wall2;
	private $Wall3;

	private $Ball;

	private $PaddleL;
	private $PaddleR;

	private $isServing;
	private $ServingLorR;
	private $ServingTimer;

	function __construct($session)
	{
		$this->Session = $session;

		//	1.000	=	1s		1/s
		//	0.100	=	0.1s	10/s
		//	0.050	=	0.05s	20/s
		//	0.025	=	0.025s	40/s
		$this->TimeStart = hrtime(true);
		$this->TimeTickCount = 0;
		//$this->TimeFrameTicker = new TimeCheck(1);
		//$this->TimeFrameTicker = new TimeCheck(0.25);
		//$this->TimeFrameTicker = new TimeCheck(0.1);
		$this->TimeFrameTicker = new TimeCheck(0.025);
		$this->TimeFrameMeasure = hrtime(true);

		$this->LimitBox = new Box(new Point(-1.0 + self::WallTickness, -0.5 + self::WallTickness), new Point(+1.0 - self::WallTickness, +0.5 - self::WallTickness));

		$this->Wall0 = new Box(new Point(+1.0 - self::WallTickness, -0.5), new Point(+1.0, +0.5));
		$this->Wall1 = new Box(new Point(-1.0, -0.5), new Point(-1.0 + self::WallTickness, +0.5));
		$this->Wall2 = new Box(new Point(-1.0, +0.5 - self::WallTickness), new Point(+1.0, +0.5));
		$this->Wall3 = new Box(new Point(-1.0, -0.5), new Point(+1.0, -0.5 + self::WallTickness));

		$this->Ball = new VelBox(new Box(new Point(-0.01, -0.01), new Point(+0.01, +0.01)), new Point(0.01, 0.005));

		$this->PaddleL = new Paddle(-0.8, 0.01, 0.1, self::PaddleSpeedAccel, self::PaddleSpeedLimit);
		$this->Session->getUserL()->setPaddle($this->PaddleL);
		$this->PaddleR = new Paddle(+0.8, 0.01, 0.1, self::PaddleSpeedAccel, self::PaddleSpeedLimit);
		//$this->Session->getUserR()->setPaddle($this->PaddleR);

		$this->isServing = false;

		$this->SendFunc("Wall0", $this->Wall0->ToJSON());
		$this->SendFunc("Wall1", $this->Wall1->ToJSON());
		$this->SendFunc("Wall2", $this->Wall2->ToJSON());
		$this->SendFunc("Wall3", $this->Wall3->ToJSON());

		$this->SendFunc("Ball", $this->Ball->ToJSON());
		$this->SendFunc("PaddleL", $this->PaddleL->ToJSON());
		$this->SendFunc("PaddleR", $this->PaddleR->ToJSON());
	}

	function SendFunc($name, $data)
	{
		$this->Session->SendSimData($name, $data);
	}

	function ShowFrameTime()
	{
		$t = hrtime(true);
		echo "Frame-Time: (should/is): "
			. $this->TimeFrameTicker->ToString()
			. "/"
			. (($t - $this->TimeFrameMeasure) / 1000000000) . "s"
			. "\n";
		$this->TimeFrameMeasure = $t;
	}
	function GetTimeStamp()
	{
		$str = "";
		$str .= ((hrtime(true) - $this->TimeStart) / 1000000000) . "s";
		$str .= " (";
		$str .= $this->TimeTickCount . " Ticks";
		$str .= ")";
		return $str;
	}

	function ServeBall($lorr)
	{
		$this->isServing = true;
		$this->ServingLorR = $lorr;
		$this->ServingTimer = new TimeCountDown(1, 3);
		$this->Ball->Vel->X = 0;
		$this->Ball->Vel->Y = 0;
	}

	function BallWallUpdate()
	{
		if ($this->Wall0->Intersect($this->Ball->Box))
		{
			$this->Ball->Vel->X = -abs($this->Ball->Vel->X);
			//echo "Wall +X after " . $this->GetTimeStamp() . "\n";
			//echo "Score L after " . $this->GetTimeStamp() . "\n";
			$this->Session->ScoreL++;
			$this->Session->SendScore();
			$this->ServeBall(false);
		}
		if ($this->Wall1->Intersect($this->Ball->Box))
		{
			$this->Ball->Vel->X = +abs($this->Ball->Vel->X);
			//echo "Wall -X after " . $this->GetTimeStamp() . "\n";
			//echo "Score R after " . $this->GetTimeStamp() . "\n";
			$this->Session->ScoreR++;
			$this->Session->SendScore();
			$this->ServeBall(true);
		}
		if ($this->Wall2->Intersect($this->Ball->Box))
		{
			$this->Ball->Vel->Y = -abs($this->Ball->Vel->Y);
			//echo "Wall +Y after " . $this->GetTimeStamp() . "\n";
		}
		if ($this->Wall3->Intersect($this->Ball->Box))
		{
			$this->Ball->Vel->Y = +abs($this->Ball->Vel->Y);
			//echo "Wall -Y after " . $this->GetTimeStamp() . "\n";
		}
	}

	function Update()
	{
		if (!$this->TimeFrameTicker->check())
			return;

		//$this->ShowFrameTime();

		if ($this->PaddleL->Intersect($this->Ball->Box))
		{
			$this->Ball->Vel->X = +abs($this->Ball->Vel->X);
			$this->Ball->Vel->Y += $this->PaddleL->GetVel()->Y * 0.25;
		}
		if ($this->PaddleR->Intersect($this->Ball->Box))
		{
			$this->Ball->Vel->X = -abs($this->Ball->Vel->X);
			$this->Ball->Vel->Y += $this->PaddleR->GetVel()->Y * 0.25;
		}

		if ($this->isServing)
		{
			if (!$this->ServingLorR)
			{
				$serve_paddle = $this->PaddleL;
				$pos = $serve_paddle->GetCenter();
				$pos->X += 0.1;
			}
			else
			{
				$serve_paddle = $this->PaddleR;
				$pos = $serve_paddle->GetCenter();
				$pos->X -= 0.1;
			}
			$this->Ball->Box->SetCenter($pos);

			$this->ServingTimer->check();
			if ($this->ServingTimer->WasTick())
			{
				//echo "Serving: " . $this->ServingTimer->GetRemaining() . "\n";
			}
			if ($this->ServingTimer->isDone())
			{
				$this->isServing = false;
				if (!$this->ServingLorR)
					$this->Ball->Vel->X = +0.01;
				else
					$this->Ball->Vel->X = -0.01;
				$this->Ball->Vel->Y = $serve_paddle->GetVel()->Y * 0.25;
			}
		}

		$this->BallWallUpdate();

		$this->PaddleL->UpdateInput();
		$this->PaddleR->UpdateInput();

		$this->PaddleL->LimitVel();
		$this->PaddleR->LimitVel();

		$this->Ball->Move();
		$this->PaddleL->Move();
		$this->PaddleR->Move();

		$this->PaddleL->LimitBox($this->LimitBox);
		$this->PaddleR->LimitBox($this->LimitBox);

		$this->SendFunc("Ball", $this->Ball->ToJSON());
		$this->SendFunc("PaddleL", $this->PaddleL->ToJSON());
		$this->SendFunc("PaddleR", $this->PaddleR->ToJSON());

		$this->TimeTickCount++;
	}
}

?>
