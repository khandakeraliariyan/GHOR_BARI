import { createBrowserRouter, Navigate } from "react-router";
import Error404Page from "./Pages/error404Page";
import HomeLayout from "./Layouts/HomeLayout";
import BuyOrRentPage from "./Pages/BuyOrRentPage/BuyOrRentPage";
import ListPropertyPage from "./Pages/ListPropertyPage/ListPropertyPage"
import HomePage from "./Pages/HomePage";
import RegisterPage from "./Pages/RegisterPage";
import LoginPage from "./Pages/LoginPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import AddProperty from "./Pages/ListPropertyPage/AddProperty";
import PropertyDetails from "./Pages/PropertyDetails/PropertyDetails";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import PublicUserProfile from "./Pages/ProfilePage/PublicUserProfile";
import DashboardLayout from "./Layouts/DashboardLayout";
import AdminDashboardHome from "./Pages/AdminDashboard/AdminDashboardHome";
import AdminRoute from "./PrivateRoute/AdminRoute";
import PendingPropertyListings from "./Pages/AdminDashboard/PendingPropertyListings";
import PendingUserVerifications from "./Pages/AdminDashboard/PendingUserVerifications";


const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout></HomeLayout>,
        children: [
            {
                index: true,
                element: <HomePage></HomePage>,
            },
            {
                path: "/register",
                element: <RegisterPage></RegisterPage>
            },
            {
                path: "/login",
                element: <LoginPage></LoginPage>
            },
            {
                path: "/reset-password",
                element: <ResetPasswordPage></ResetPasswordPage>
            },
            {
                path: "/properties",
                element: <PrivateRoute><BuyOrRentPage></BuyOrRentPage></PrivateRoute>
            },
            {
                path: "/property-details/:id",
                element: <PrivateRoute><PropertyDetails></PropertyDetails></PrivateRoute>
            },
            {
                path: "/list-property",
                element: <PrivateRoute><ListPropertyPage></ListPropertyPage></PrivateRoute>
            },
            {
                path: "/add-property",
                element: <PrivateRoute><AddProperty></AddProperty></PrivateRoute>
            },

            {
                path: "/profile",
                element: <PrivateRoute><ProfilePage></ProfilePage></PrivateRoute>
            },
            {
                path: "/owner-profile/:email",
                element: <PrivateRoute><PublicUserProfile></PublicUserProfile></PrivateRoute>
            }
        ]
    },
    {
        path: "/dashboard",
        element: <AdminRoute><DashboardLayout /></AdminRoute>,
        children: [
            {
                index: true,
                element: <AdminDashboardHome></AdminDashboardHome>
            },
            {
                path: "pending-properties",
                element: <AdminRoute><PendingPropertyListings></PendingPropertyListings></AdminRoute>
            },
            {
                path: "pending-verifications",
                element: <AdminRoute><PendingUserVerifications></PendingUserVerifications></AdminRoute>
            },
            {
                path: "property-details/:id",
                element: <AdminRoute><PropertyDetails isAdminPreview={true} /></AdminRoute>
            },
        ]
    },
    {
        path: "*",
        element: <Error404Page></Error404Page>,
    }
])

export default router;