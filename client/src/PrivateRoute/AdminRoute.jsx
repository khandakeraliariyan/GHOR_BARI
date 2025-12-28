import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuth from '../Hooks/useAuth';
import useAdmin from '../Hooks/useAdmin';
import Loading from '../Components/Loading';
import { showToast } from '../Utilities/ToastMessage';

const AdminRoute = ({ children }) => {
    const { user, loading: authLoading, logoutUser } = useAuth();
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();

    useEffect(() => {
        // Eject user - Auth is done, Admin check is done, user exists but is NOT admin
        if (!authLoading && !isAdminLoading && user && isAdmin === false) {
            const ejectUser = async () => {
                await logoutUser();
                showToast("Security: Admin privileges required. Account logged out.", "error");
            };
            ejectUser();
        }
    }, [authLoading, isAdminLoading, user, isAdmin, logoutUser]);

    // global loading
    if (authLoading || isAdminLoading) {
        return <Loading />;
    }

    // Render children only if both conditions are met
    if (user && isAdmin) {
        return children;
    }

    // Fallback redirect (useEffect handles the actual logout)
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;