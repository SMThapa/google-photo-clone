import axios from "axios";

const API = axios.create({
    baseURL: "/api/auth",
});

export const registerUser = async (userData) => {
    const response = await API.post(
        "/register",
        userData
    );

    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await API.post(
        "/login",
        credentials
    );

    return response.data;
};