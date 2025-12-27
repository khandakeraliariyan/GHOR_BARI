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
                path: "/properties",
                element: <BuyOrRentPage></BuyOrRentPage>
            },
            {
                path: "/property-details/:id",
                element: <PropertyDetails></PropertyDetails>
            },
            {
                path: "/list-property",
                element: <ListPropertyPage></ListPropertyPage>
            },
            {
                path: "/add-property",
                element: <AddProperty></AddProperty>
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
                path: "/profile",
                element: <ProfilePage></ProfilePage>
            }

        ]

    },

    {
        path: "*",
        element: <Error404Page></Error404Page>,
    }
])

export default router;