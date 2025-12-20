import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    // TEMP : Authentication state
    const isLoggedIn = false;

    return (
        <header className="w-full bg-white shadow-md relative z-50">
            <nav className="mx-auto w-11/12 px-4 h-16 flex items-center justify-between">
                {/* LOGO */}
                <Link
                    to="/"
                    className="text-xl md:text-2xl font-bold text-orange-500 tracking-wide"
                >
                    GhorBari
                </Link>

                {/* NAV LINKS - DESKTOP */}
                <div className="hidden md:flex items-center gap-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }`
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/properties"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }`
                        }
                    >
                        Buy / Rent
                    </NavLink>

                    <NavLink
                        to="/list-property"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }`
                        }
                    >
                        List Property
                    </NavLink>

                    <NavLink
                        to="/messages"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }`
                        }
                    >
                        Messages
                    </NavLink>
                </div>

                {/* AUTH BUTTONS - DESKTOP */}
                <div className="hidden md:flex items-center gap-4">
                    {!isLoggedIn && (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm md:text-base font-medium border border-orange-400 text-orange-500 rounded-md hover:bg-orange-400/10 transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm md:text-base font-medium bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-md hover:brightness-110 transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* MOBILE MENU BUTTON */}
                <div className="md:hidden flex items-center gap-3">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU */}
            {menuOpen && (
                <div className="md:hidden bg-white shadow-inner">
                    <div className="flex flex-col px-4 py-3 gap-2">
                        <NavLink
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }`
                            }
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/properties"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }`
                            }
                        >
                            Buy / Rent
                        </NavLink>

                        <NavLink
                            to="/list-property"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }`
                            }
                        >
                            List Property
                        </NavLink>

                        <NavLink
                            to="/messages"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }`
                            }
                        >
                            Messages
                        </NavLink>

                        {!isLoggedIn && (
                            <div className="flex gap-2 pt-3 flex-col">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full text-center px-4 py-2 text-sm font-medium border border-orange-400 text-orange-500 rounded-md hover:bg-orange-400/10 transition"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full text-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-md hover:brightness-110 transition"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
