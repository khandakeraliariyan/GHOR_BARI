import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import errorImage from "../assets/404Image.jpg";

const Error404Page = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100">
            {/* Image Section */}
            <div className="h-[40vh] md:h-[70vh] w-full">
                <img
                    src={errorImage}
                    alt="404 Not Found"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Action Section */}
            <div className="flex flex-col items-center justify-start gap-3 flex-1 pt-4 md:pt-10">
                <h1 className="text-3xl sm:text-4xl md:text-3xl font-extrabold text-gray-900 text-center mb-4 md:mb-5">
                    Oops! Page not found
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50 font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:shadow-lg shadow-orange-200 font-bold uppercase tracking-wider transition-all flex items-center gap-2"
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
