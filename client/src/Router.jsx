import { createBrowserRouter, Navigate } from "react-router";
import Error404Page from "./Pages/error404Page";


const router = createBrowserRouter([
    {
        path: "/",
        element: <h1>Home layout</h1>,
        children: [
            {
                index: true,
                element: <h1>Home Page</h1>,
            },

        ]

    },

    {
        path: "*",
        element: <Error404Page></Error404Page>,
    }
])

export default router;