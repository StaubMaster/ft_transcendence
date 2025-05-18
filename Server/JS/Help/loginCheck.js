
export function lazyCheckAlphaNumeric(str)
{
	var i, c;

	for (i = 0; i < str.length; i++)
	{
		c = str[i];
		if (!(c >= 'a' && c <= 'z') &&
			!(c >= 'A' && c <= 'Z') &&
			!(c >= '0' && c <= '9'))
		{
			return false;
		}
	}
	return true;
}
