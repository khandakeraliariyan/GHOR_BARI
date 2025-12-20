import React from 'react';
import Banner from "../Components/Banner.jsx";
import WhyChooseUs from '../Components/WhyChooseUs.jsx';

const HomePage = () => {
    return (
        <div className='min-h-screen'>
            <Banner></Banner>
            <WhyChooseUs></WhyChooseUs>
        </div>
    );
};

export default HomePage;