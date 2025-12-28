import axios from "axios";
import { useNavigate } from "react-router";
import { getAuth, signOut } from "firebase/auth";
import { useEffect } from "react";

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        // Intercept Request to add Authorization Header
        const requestInterceptor = axiosSecure.interceptors.request.use(
            async (config) => {
                const user = auth.currentUser;
                if (user) {
                    const token = await user.getIdToken();
                    config.headers.authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Intercept Response to handle 401/403 errors
        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => response,
            async (error) => {
                const status = error.response ? error.response.status : null;
                if (status === 401 || status === 403) {
                    // Force logout on unauthorized access
                    await signOut(auth);
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptors on unmount
        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        };
    }, [auth, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;