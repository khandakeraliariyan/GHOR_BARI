import React, { useState } from 'react';
import useWishlist from '../../Hooks/useWishlist';
import useAuth from '../../Hooks/useAuth';
import PropertyCard from '../BuyOrRentPage/PropertyCard';

const WishlistPage = () => {
    const { user } = useAuth();
    const { wishlistItems, loading, remove, updateNote } = useWishlist();
    const [editingId, setEditingId] = useState(null);
    const [tempNote, setTempNote] = useState('');

    if (!user) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-500">Please login to view and manage your property wishlist.</p>
                </div>
            </div>
        );
    }

    const handleEdit = (item) => {
        setEditingId(item._id);
        setTempNote(item.wishlistNote || '');
    };

    const saveNote = async (id) => {
        await updateNote(id, tempNote);
        setEditingId(null);
        setTempNote('');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
                        <p className="text-gray-500 mt-1">Manage your favorite properties and personal reminders.</p>
                    </div>
                    {!loading && wishlistItems.length > 0 && (
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
                            {wishlistItems.length} Saved Properties
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-lg">Your wishlist is currently empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlistItems.map((item) => (
                            <div key={item._id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                                {/* Property Image/Info Component */}
                                <div className="flex-1">
                                    <PropertyCard property={item} />
                                </div>

                                {/* Personal Notes Section */}
                                <div className="p-5 bg-gray-50/50 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Personal Note</span>
                                    </div>

                                    {editingId === item._id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={tempNote}
                                                onChange={(e) => setTempNote(e.target.value)}
                                                placeholder="What did you like about this property?"
                                                className="w-full text-sm border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none bg-white shadow-inner"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => saveNote(item._id)}
                                                    className="flex-1 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                                                >
                                                    Save Note
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-4 py-2 bg-white text-gray-500 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <p className="text-sm text-gray-600 leading-relaxed min-h-[40px]">
                                                {item.wishlistNote ? (
                                                    item.wishlistNote
                                                ) : (
                                                    <span className="italic text-gray-300">Add a note for yourself...</span>
                                                )}
                                            </p>
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => remove(item._id)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;