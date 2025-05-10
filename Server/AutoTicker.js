
import { SessionPong } from "./Session/SesPong.js";
import { TimeTicker } from "./TimeTicker.js";
import { WS } from "./ws.js";
import { User } from "./User.js";
import * as api from './API_Const.js';

var secondTicker = new TimeTicker(1.0);
setInterval(function ()
{
	SessionPong.All_Update();
	if (secondTicker.check())
	{
		const table = User.All_Table();
		WS.All_Send(api.USER_Table_List + table);
		User.All_Invite_Tables();
	}
}, 1);
