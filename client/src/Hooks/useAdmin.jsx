import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxios from "./useAxios";

const useAdmin = () => {
    const { user, loading: authLoading } = useAuth();
    const axios = useAxios();

    const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        // Only run if auth is finished AND we have a user
        enabled: !authLoading && !!user?.email,
        queryFn: async () => {
            const token = await user.getIdToken();
            const res = await axios.get(`/users/admin/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data?.admin || false;
        }
    });

    return [isAdmin, isAdminLoading];
};

export default useAdmin;