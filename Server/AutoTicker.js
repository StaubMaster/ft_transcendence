
import * as api from '../Help/API_Const.js';
import { TimeTicker } from "../Help/TimeTicker.js";
import { User } from "./User.js";
import { SessionPong } from "./Session/SesPong.js";

var secondTicker = new TimeTicker(1.0);
setInterval(function ()
{
	SessionPong.All_Update();
	if (secondTicker.check())
	{
		const table = User.All_Table();
		User.All_Send(api.USER_Table_List + table);
		User.All_Invite_Tables();
	}
}, 1);
