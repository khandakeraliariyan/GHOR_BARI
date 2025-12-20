import React from "react";
import { FourSquare } from "react-loading-indicators";

const Loading = () => {
    return (
        <div className="min-h-screen flex items-center justify-center w-full">
            <FourSquare
                color="#F97316"
                size="medium"
                text=""
                textColor="#111827"
            />
        </div>
    );
};

export default Loading;