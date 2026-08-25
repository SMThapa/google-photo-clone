import { FaPlus } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import user from '../assets/images/download.jpg';

import { toast } from "react-toastify";

export const TopMenu = () => {

    const handleUpload = async (files) => {
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append("images", file);
        });

        const total = files.length;

        const toastId = toast.loading(
            `Uploading ${total} image(s) ...`
        );

        await axios.post("/api/media/upload", formData);

        window.location.reload();

        toast.update(toastId, {
            render: `Image(s) uploaded complete.`,
            type: "success",
            isLoading: false,
            autoClose: 3000
        });
    };

    return (
        <div className="top_menu">

            <div className="logo">Google Photo <span>Clone</span></div>
            <div className="top_nav_contents">
                <div className="search">
                    <label htmlFor="search"><IoSearch /></label>
                    <input type="search" placeholder="Search you photo" id="search" />
                </div>
                <div className="action-buttons">
                    <div className="button-group">
                        <button className="tooltip" data-tooltip="Add Images">
                            <label htmlFor="file_upload"><FaPlus /></label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleUpload(e.target.files)}
                                id='file_upload'
                            />
                        </button>
                        <button className="tooltip" data-tooltip="Settings"><IoIosSettings /></button>
                    </div>
                    <div className="user">
                        <img src={user} alt="user_image" />
                        <div className="user_info">
                            <p className="username">Siddharth Thapa</p>
                            <p className="email">sidothapa@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
