
<?php

function str_starts_with($str, $match)
{
	return substr($str, 0, strlen($match)) === $match;
}

function str_ends_with($str, $match)
{
	return substr($str, -strlen($match)) === $match;
}

function str_contains($str, $match)
{
	return strpos($str, $match) !== false;
}

?>
