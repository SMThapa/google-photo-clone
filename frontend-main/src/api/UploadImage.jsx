import axios from "axios";

export const uploadImages = async (files) => {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
        formData.append("images", file);
    });

    const response = await axios.post(
        "/api/media/upload",
        formData
    );

    return response.data;
};