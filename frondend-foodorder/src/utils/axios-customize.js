import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { notification } from "antd";

const instance = axiosClient.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

const mutex = new Mutex();
const NO_RETRY_HEADER = "x-no-retry";

const handleRefreshToken = async () => {
    return await mutex.runExclusive(async () => {
        const res = await instance.get("/api/v1/auth/refresh");
        if (res && res.data) return res.data.access_token;
        else return null;
    });
};

instance.interceptors.request.use(function (config) {
    const isResetPassword = config.url.includes("/api/v1/auth/reset-password");
    if (isResetPassword) return config;
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
    return config;
});

instance.interceptors.response.use(
    (res) => res.data,
    async (error) => {
        if (error.response?.request?.responseURL?.includes("accounts.google.com")) {
            notification.error({
                message: "Authentication Failed",
                description: "Google OAuth rejected the request. Please log in again.",
            });
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        if (
            error.config &&
            error.response?.status === 401 &&
            error.config.url !== "/api/v1/auth/login" &&
            !error.config.headers[NO_RETRY_HEADER]
        ) {
            const access_token = await handleRefreshToken();
            error.config.headers[NO_RETRY_HEADER] = "true";
            if (access_token) {
                error.config.headers["Authorization"] = `Bearer ${access_token}`;
                localStorage.setItem("access_token", access_token);
                return instance.request(error.config);
            } else {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }

        if (
            error.config &&
            error.response?.status === 400 &&
            error.config.url === "/api/v1/auth/refresh"
        ) {
            localStorage.removeItem("access_token");
            if (
                window.location.pathname !== "/" &&
                !window.location.pathname.startsWith("/book")
            ) {
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            notification.error({
                message: error?.response?.data?.message ?? "Access Denied",
                description: error?.response?.data?.error ?? "You do not have permission.",
            });
            return Promise.reject(error.response.data);
        }

        return error?.response?.data ?? Promise.reject(error);
    }
);

export default instance;