import React from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuth from '../Hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Loading from '../Components/Loading';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. Handle the Loading State
    if (loading) {
        return (
            <Loading></Loading>
        );
    }

    // 2. If user is logged in, return the children (the protected page)
    if (user) {
        return children;
    }

    // 3. If not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;