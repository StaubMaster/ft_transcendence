
<?php

class Command
{
	private $Name;

	public function __construct($name)
	{
		$this->Name = $name;
	}

	public function is($str)
	{
		return str_starts_with($str, $this->Name);
	}

	public function value($str)
	{
		if (str_starts_with($str, $this->Name))
		{
			return substr($str, strlen($this->Name));
		}
		return false;
	}

	//abstract public function do(...$args);
}

?>
