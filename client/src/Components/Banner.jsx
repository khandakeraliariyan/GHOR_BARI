import React from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

// Import images
import bannerImg1 from "../assets/banner-1.jpg";
import bannerImg2 from "../assets/banner-2.jpg";
import bannerImg3 from "../assets/banner-3.jpg";
import bannerImg4 from "../assets/banner-4.jpg";
import bannerImg5 from "../assets/banner-5.jpg";
import bannerImg6 from "../assets/banner-6.jpg";
import bannerImg7 from "../assets/banner-7.jpg";
import bannerImg8 from "../assets/banner-8.jpg";

const images = [
    bannerImg8,
    bannerImg2,
    bannerImg3,
    bannerImg4,
    bannerImg5,
    bannerImg6,
    bannerImg7,
    bannerImg1,
];

const Banner = () => {
    return (
        <section className="w-full flex flex-col bg-white">
            {/* Image Slider */}
            <div className="relative w-full h-[30vh] md:h-[50vh] lg:h-[90vh]">
                <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    slidesPerView={1}
                    speed={1200}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    loop
                    className="h-full w-full"
                >
                    {images.map((img, index) => (
                        <SwiperSlide key={index}>
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-1000"
                                style={{ backgroundImage: `url(${img})` }}
                            >
                                <div className="absolute inset-0 bg-black/45" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Text Content */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
                    {/* Capsule */}
                    <div className="flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-2 rounded-full 
              bg-orange-500/20 backdrop-blur-md border border-orange-400/30 
              text-orange-300 text-[10px] md:text-xs lg:text-sm font-semibold mb-3 lg:mb-6">
                        <Sparkles size={14} className="lg:w-[18px]" />
                        <span className="uppercase tracking-widest">Premium Real Estate</span>
                    </div>

                    {/* Title*/}
                    <h1 className="text-xl md:text-4xl lg:text-7xl font-extrabold text-white max-w-5xl leading-tight">
                        <Typewriter
                            words={["Discover Extraordinary Properties"]}
                            loop={1}
                            cursor
                            cursorStyle="|"
                            typeSpeed={70}
                        />
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-2 md:mt-4 lg:mt-6 text-gray-200 text-[10px] md:text-base lg:text-xl max-w-2xl font-light">
                        <Typewriter
                            words={[
                                "Luxury living with verified properties in prestigious locations across Bangladesh",
                            ]}
                            loop={1}
                            typeSpeed={40}
                            delaySpeed={1500}
                        />
                    </p>
                </div>

                {/* Search Card - Desktop (overlapping slider) */}
                <div className="hidden lg:block absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 w-full max-w-5xl px-4">
                    <SearchCard />
                </div>
            </div>

            {/* Search Card - Mobile & Tablet (stacked under slider) */}
            <div className="lg:hidden w-full px-4 py-8 bg-white z-30">
                <SearchCard />
            </div>

            {/* Spacer for Desktop */}
            <div className="hidden lg:block h-36"></div>
        </section>
    );
};

const SearchCard = () => {
    const [value, setValue] = React.useState("");
    const [focused, setFocused] = React.useState(false);

    return (
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl p-5 lg:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Input */}
                <div className="relative flex items-center flex-1 w-full">
                    <Search className="absolute left-4 text-gray-400" size={20} />

                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="w-full pl-12 pr-4 py-4 lg:py-5 bg-gray-50 rounded-xl
              border border-gray-100 focus:border-orange-300 focus:bg-white
              outline-none transition-all text-sm lg:text-lg font-medium"
                    />

                    {!value && !focused && (
                        <div className="absolute left-12 text-gray-400 text-sm lg:text-lg pointer-events-none">
                            <Typewriter
                                words={[
                                    "Search by location...",
                                    "Search by area...",
                                    "Search by landmark...",
                                ]}
                                loop
                                cursor
                                cursorStyle="_"
                                typeSpeed={60}
                                deleteSpeed={40}
                                delaySpeed={2000}
                            />
                        </div>
                    )}
                </div>

                {/* Button */}
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 lg:py-5 rounded-xl text-white font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:brightness-110 hover:shadow-lg transition-all active:scale-95 shadow-orange-200">
                    <span className="text-sm lg:text-base">Explore Properties</span>
                    <ArrowRight size={20} />
                </button>
            </div>

            {/* Explore Link */}
            <div className="mt-6 flex justify-center">
                <a
                    href="/properties"
                    className="group flex items-center gap-2 text-gray-500 hover:text-orange-600 font-semibold transition-all duration-300 cursor-pointer"
                >
                    <span className="text-xs md:text-sm lg:text-base">Explore All Properties</span>
                    <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                    />
                </a>
            </div>
        </div>
    );
};

export default Banner;
