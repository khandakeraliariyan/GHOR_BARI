import React from 'react';
import { Link } from 'react-router';
import { Crown, ArrowRight, PlusCircle } from 'lucide-react';

const BeginYourPropertyJourney = () => {
    return (
        <section className="bg-gray-100 py-12 md:py-24 px-4">
            <div className="max-w-11/12 mx-auto">
                {/* Main Card Container */}
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-white group">

                    {/* Subtle Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 py-12 md:py-16 px-6 md:px-12 flex flex-col items-center text-center">

                        {/* Crown Icon with Hover Flip Animation */}
                        <div className="mb-6 p-4 bg-orange-50 text-orange-500 rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                            <Crown size={32} />
                        </div>

                        {/* Heading with Brand Gradient */}
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
                            Begin Your <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Property Journey</span> Today
                        </h2>

                        {/* Subtitle */}
                        <p className="text-gray-500 text-sm md:text-lg max-w-2xl mb-10 font-light leading-relaxed">
                            Join Bangladesh's most trusted luxury property platform with thousands of verified listings tailored to your extraordinary lifestyle.
                        </p>

                        {/* Navigation Links Styled as Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">

                            {/* Browse Properties*/}
                            <Link
                                to="/properties"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-xl border-2 border-orange-100 shadow-sm hover:shadow-orange-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                Browse Properties
                                <ArrowRight size={20} />
                            </Link>

                            {/* List Property */}
                            <Link
                                to="/list-property"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                <PlusCircle size={20} />
                                List Your Property
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BeginYourPropertyJourney;