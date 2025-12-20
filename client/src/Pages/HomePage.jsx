import React, { useEffect } from 'react';
import Banner from "../Components/Banner.jsx";
import WhyChooseUs from '../Components/WhyChooseUs.jsx';
import HomePageStats from '../Components/HomePageStats.jsx';
import BeginYourPropertyJourney from '../Components/BeginYourPropertyJourney.jsx';

const HomePage = () => {
   

    return (
        <div className='min-h-screen'>
            <Banner></Banner>
            <HomePageStats></HomePageStats>
            <WhyChooseUs></WhyChooseUs>
            <BeginYourPropertyJourney></BeginYourPropertyJourney>
        </div>
    );
};

export default HomePage;