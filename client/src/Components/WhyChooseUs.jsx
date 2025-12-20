import React from 'react';
import { ShieldCheck, Zap, Headphones, BarChart3 } from 'lucide-react';

const WhyChooseUs = () => {
    const features = [
        {
            icon: ShieldCheck,
            title: "NID Verified Security",
            description:
                "Every property owner undergoes rigorous NID verification ensuring complete safety and authenticity for your peace of mind.",
        },
        {
            icon: Zap,
            title: "AI Smart Pricing",
            description:
                "Advanced algorithms analyze market trends to provide transparent and fair pricing recommendations for every prestigious location.",
        },
        {
            icon: BarChart3,
            title: "Market Insights",
            description:
                "Gain access to intelligent data analytics and location-based trends to make informed investment decisions.",
        },
        {
            icon: Headphones,
            title: "Premium Support",
            description:
                "Dedicated concierge service with expert guidance throughout your property journey, from search to final signing.",
        },
    ];

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* SECTION HEADER */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Why Choose{" "}
                        <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                            GhorBari
                        </span>
                    </h2>
                    <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto font-light">
                        Experience a new standard of real estate excellence where luxury
                        meets transparency and cutting-edge technology.
                    </p>
                </div>

                {/* FEATURES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                            >
                                {/* ICON BOX */}
                                <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-yellow-500 transition-colors duration-300">
                                    <Icon className="text-orange-500 group-hover:text-white transition-colors duration-300" size={32} />
                                </div>

                                {/* TEXT CONTENT */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
