import axios from "axios";

// create axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `https://ghorbari-a-smart-property-listing.onrender.com/`, // will need to replaace this one when we deploy the project
});

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;
