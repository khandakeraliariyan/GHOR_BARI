import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* MAIN FOOTER CONTENT */}
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">

                {/* LEFT — BRAND */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold text-orange-400">
                        GhorBari
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                        Bangladesh&apos;s premier luxury property platform. <br />
                        Connecting discerning buyers with exceptional homes.
                    </p>
                </div>

                {/* DISCOVER */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">
                        Discover
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            Properties
                        </li>
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            Locations
                        </li>
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            New Listings
                        </li>
                    </ul>
                </div>

                {/* COMPANY */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">
                        Company
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            About
                        </li>
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            Contact
                        </li>
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            Careers
                        </li>
                    </ul>
                </div>

                {/* LEGAL */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">
                        Legal
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            Privacy
                        </li>
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            Terms
                        </li>
                        <li className="hover:text-orange-400 transition cursor-pointer">
                            Cookies
                        </li>
                    </ul>
                </div>
            </div>

            {/* FULL-WIDTH LINE */}
            <div className="w-full h-px bg-gray-700" />

            {/* BOTTOM BAR */}
            <div className="py-4 text-center text-xs text-gray-400">
                © 2024 GhorBari. Developed by{" "}
                <span className="text-gray-300">
                    Samiun Alim Auntor, Nayef Wasit Siddiqui &amp; Khandakar Ali Ariyan
                </span>
            </div>
        </footer>
    );
};

export default Footer;
