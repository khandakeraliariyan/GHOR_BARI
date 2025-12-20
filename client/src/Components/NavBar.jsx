import { useState } from "react";
import { Menu, X, UserCircle } from "lucide-react";
import { Link, NavLink } from "react-router";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    // TEMP state (replace later with auth)
    const isLoggedIn = false;
    const userRole = "Seeker"; // Seeker | Owner | Admin

    return (
        <header className="w-full bg-white shadow-md relative z-50">
            <nav className="mx-auto px-4 h-16 flex items-center justify-between">
                {/* LEFT — LOGO */}
                <Link
                    to="/"
                    className="text-xl font-bold text-orange-500 tracking-wide"
                >
                    GhorBari
                </Link>

                {/* MIDDLE — NAV LINKS (DESKTOP) */}
                <div className="hidden md:flex items-center gap-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `
              px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-200 ease-out
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }
            `
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/buy-or-rent"
                        className={({ isActive }) =>
                            `
              px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-200 ease-out
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }
            `
                        }
                    >
                        Buy / Rent
                    </NavLink>

                    <NavLink
                        to="/list-property"
                        className={({ isActive }) =>
                            `
              px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-200 ease-out
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }
            `
                        }
                    >
                        List Property
                    </NavLink>

                    <NavLink
                        to="/messages"
                        className={({ isActive }) =>
                            `
              px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-200 ease-out
              ${isActive
                                ? "bg-orange-400 text-white"
                                : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                            }
            `
                        }
                    >
                        Messages
                    </NavLink>
                </div>

                {/* RIGHT — AUTH / USER (DESKTOP) */}
                <div className="hidden md:flex items-center gap-4">
                    {!isLoggedIn ? (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-medium
                border border-orange-400 text-orange-500 rounded-md
                hover:bg-orange-400/10 transition"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm font-medium
                bg-orange-400 text-white rounded-md
                hover:bg-orange-500 transition"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <UserCircle className="w-8 h-8 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                                {userRole}
                            </span>
                        </div>
                    )}
                </div>

                {/* MOBILE — AVATAR + HAMBURGER */}
                <div className="md:hidden flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <UserCircle className="w-7 h-7 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">
                            {isLoggedIn ? userRole : "Guest"}
                        </span>
                    </div>

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
                                `
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-200 ease-out
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }
              `
                            }
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/buy-rent"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-200 ease-out
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }
              `
                            }
                        >
                            Buy / Rent
                        </NavLink>

                        <NavLink
                            to="/list-property"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-200 ease-out
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }
              `
                            }
                        >
                            List Property
                        </NavLink>

                        <NavLink
                            to="/messages"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-200 ease-out
                ${isActive
                                    ? "bg-orange-400 text-white"
                                    : "text-gray-700 hover:bg-orange-400/20 hover:text-orange-600"
                                }
              `
                            }
                        >
                            Messages
                        </NavLink>

                        {!isLoggedIn && (
                            <div className="flex gap-2 pt-3">
                                <Link
                                    to="/login"
                                    className="w-full text-center px-4 py-2
                  text-sm font-medium border border-orange-400
                  text-orange-500 rounded-md hover:bg-orange-400/10 transition"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="w-full text-center px-4 py-2
                  text-sm font-medium bg-orange-400 text-white
                  rounded-md hover:bg-orange-500 transition"
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
