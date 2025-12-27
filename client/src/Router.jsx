import { createBrowserRouter, Navigate } from "react-router";
import Error404Page from "./Pages/error404Page";
import HomeLayout from "./Layouts/HomeLayout";
import BuyOrRentPage from "./Pages/BuyOrRentPage/BuyOrRentPage";
import ListPropertyPage from "./Pages/ListPropertyPage/ListPropertyPage"
import HomePage from "./Pages/HomePage";
import RegisterPage from "./Pages/RegisterPage";
import LoginPage from "./Pages/LoginPage";
import AddProperty from "./Pages/ListPropertyPage/AddProperty";
import PropertyDetails from "./Pages/PropertyDetails/PropertyDetails";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import PublicUserProfile from "./Pages/ProfilePage/PublicUserProfile";


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
        path: "*",
        element: <Error404Page></Error404Page>,
    }
])

export default router;