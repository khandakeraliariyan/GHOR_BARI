import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import errorImage from "../assets/404Image.jpg";

const Error404Page = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Image Section */}
            <div className="h-[40vh] md:h-[70vh] w-full">
                <img
                    src={errorImage}
                    alt="404 Not Found"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Action Section */}
            <div className="flex flex-col items-center justify-start gap-3 flex-1 bg-base-100 pt-4 md:pt-10">
                <h1 className="text-3xl sm:text-4xl md:text-3xl font-bold text-center">
                    Oops! Page not found
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-outline rounded-xl border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="btn rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                    >
                        <Home size={18} />
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Error404Page;
