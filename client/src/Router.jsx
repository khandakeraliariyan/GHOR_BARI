import { createBrowserRouter, Navigate } from "react-router";
import Error404Page from "./Pages/error404Page";
import HomeLayout from "./Layouts/HomeLayout";
import BuyOrRentPage from "./Pages/BuyOrRentPage/BuyOrRentPage";
import ListPropertyPage from "./Pages/ListPropertyPage/ListPropertyPage"
import HomePage from "./Pages/HomePage";


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
                path: "/buy-or-rent",
                element: <BuyOrRentPage></BuyOrRentPage>
            },
            {
                path: "/list-property",
                element: <ListPropertyPage></ListPropertyPage>
            }

        ]

    },

    {
        path: "*",
        element: <Error404Page></Error404Page>,
    }
])

export default router;