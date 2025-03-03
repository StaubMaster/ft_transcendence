
<?php

class Log
{
	const FilePath = "log_file.log";

	public static function NewFile()
	{
		file_put_contents(self::FilePath, "new Log File\n\n", 0);
	}

	public static function ToFile($str)
	{
		file_put_contents(self::FilePath, $str, FILE_APPEND);
	}
}

?>
