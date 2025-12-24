import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import useAuth from "./useAuth";

const useRole = () => {
    const { user } = useAuth();
    const axios = useAxios();

    const { data, isLoading, isError, refetch } = useQuery(
        ["user-role", user?.email],
        async () => {
            if (!user?.email) return null;

            // Call backend API
            const response = await axios.get(`/get-user-role?email=${user.email}`);
            return response.data.role;
        },
        {
            enabled: !!user?.email,
            staleTime: 1000 * 60 * 5,
            retry: 1,
        }
    );

    return { role: data, isLoading, isError, refetch };
};

export default useRole;
