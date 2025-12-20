import React from 'react';
import Banner from "../Components/Banner.jsx";
import WhyChooseUs from '../Components/WhyChooseUs.jsx';
import HomePageStats from '../Components/HomePageStats.jsx';

const HomePage = () => {
    return (
        <div className='min-h-screen'>
            <Banner></Banner>
            <HomePageStats></HomePageStats>
            <WhyChooseUs></WhyChooseUs>
        </div>
    );
};

export default HomePage;