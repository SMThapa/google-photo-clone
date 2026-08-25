import { IoCloudOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";

import { NavLink } from "react-router-dom";

export const SideMenu = () => {
    return (
        <div className="side_menu">
            <div className="top_items">
                <div className="all_menu">
                    <NavLink className="menu"><IoImageOutline /> Images</NavLink>
                </div>
            </div>
            <div className="bottom_items">
                <div className="menu"><IoCloudOutline /> Storage</div>
            </div>
        </div>
    )
}
