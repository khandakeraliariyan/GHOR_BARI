import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
    LayoutDashboard,
    Home,
    ClipboardList,
    UserCheck,
    LogOut,
    Building2
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import useAuth from '../Hooks/useAuth';
import { showToast } from '../Utilities/ToastMessage';

const DashboardLayout = () => {
    // Destructure logoutUser
    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Calling the logout function from authProvider
            await logoutUser();
            showToast("Logged out successfully", "success");
            navigate('/');
        } catch (error) {
            console.error("Logout Error:", error);
            showToast("Failed to sign out", "error");
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard Home', path: '/dashboard' },
        { icon: ClipboardList, label: 'Pending Property Approvals', path: '/dashboard/pending-properties' },
        { icon: UserCheck, label: 'Pending User Verifications', path: '/dashboard/pending-verifications' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-20 flex flex-col items-center py-8 bg-[#1A1A2E] text-white shadow-2xl shrink-0">
                

                {/* Nav Links */}
                <nav className="flex-1 flex flex-col gap-6">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            data-tooltip-id="dash-tooltip"
                            data-tooltip-content={item.label}
                            className={({ isActive }) => `
                p-3 rounded-2xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 scale-110'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
            `}
                        >
                            {({ isActive }) => (
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            )}
                        </NavLink>
                    ))}
                </nav>
                {/* Footer Actions */}
                <div className="mt-auto flex flex-col gap-6 pt-6 border-t border-white/10">
                    <NavLink
                        to="/"
                        data-tooltip-id="dash-tooltip"
                        data-tooltip-content="Back to Home"
                        className="p-3 text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                        <Home size={24} />
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        data-tooltip-id="dash-tooltip"
                        data-tooltip-content="Logout Account"
                        className="p-3 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer outline-none"
                    >
                        <LogOut size={24} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>

            {/* Tooltip Styling */}
            <Tooltip
                id="dash-tooltip"
                place="right"
                offset={20}
                className="!bg-gray-900 !text-white !text-[10px] !font-black !uppercase !tracking-widest !px-3 !py-2 !rounded-lg !z-[9999] !opacity-100 shadow-xl"
            />
        </div>
    );
};

export default DashboardLayout;