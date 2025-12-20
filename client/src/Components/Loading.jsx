import React from "react";
import { FourSquare } from "react-loading-indicators";

const Loading = () => {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
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