import React, { useState } from 'react';
import { X, Handshake, Edit, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import { showToast } from '../../Utilities/ToastMessage';
import { useQueryClient } from '@tanstack/react-query';
import ReviseOfferModal from './ReviseOfferModal';

const CounterOfferModal = ({ isOpen, onClose, application }) => {
    const { user } = useAuth();
    const axios = useAxios();
    const queryClient = useQueryClient();
    const [showReviseModal, setShowReviseModal] = useState(false);

    if (!isOpen || !application || !application.property) return null;

    const property = application.property;

    // Get user's previous offer from priceHistory (most recent seeker offer before owner's counter)
    const getUserPreviousOffer = () => {
        if (!application.priceHistory || !Array.isArray(application.priceHistory)) {
            return null;
        }
        // Get all seeker prices, sorted by timestamp (most recent last)
        const seekerPrices = application.priceHistory
            .filter(entry => entry.setBy === 'seeker')
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        // Return the most recent seeker offer (last one in sorted array)
        return seekerPrices.length > 0 ? seekerPrices[seekerPrices.length - 1].price : null;
    };

    const userPreviousOffer = getUserPreviousOffer();
    const ownerCounterOffer = application.proposedPrice; // Current proposedPrice is owner's counter
    const originalListingPrice = property.price;

    const handleAcceptCounter = async () => {
        const result = await Swal.fire({
            title: 'Accept Counter Offer?',
            html: `
                <p class="text-left mb-4">Are you sure you want to accept the owner's counter offer?</p>
                <div class="text-left space-y-2">
                    <p><strong>Property:</strong> ${property.title || 'N/A'}</p>
                    <p><strong>Owner's Counter Offer:</strong> ৳${ownerCounterOffer?.toLocaleString() || 'N/A'}</p>
                    <p><strong>Original Listing Price:</strong> ৳${originalListingPrice?.toLocaleString() || 'N/A'}</p>
                </div>
                <p class="text-left mt-4 text-sm text-gray-600">Accepting this will complete the deal and the property will be marked as deal-in-progress.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Accept & Close Deal',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = await user.getIdToken();
                await axios.patch(`/application/${application._id}/accept-counter`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                showToast('Counter offer accepted! Deal is now in progress.', 'success');
                queryClient.invalidateQueries({ queryKey: ['my-applications', user?.email] });
                queryClient.invalidateQueries({ queryKey: ['property', application.propertyId] });
                queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });
                onClose();
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to accept counter offer', 'error');
            }
        }
    };

    const handleReviseClick = () => {
        setShowReviseModal(true);
    };

    const handleReviseModalClose = () => {
        setShowReviseModal(false);
        // Refresh data when revise modal closes
        queryClient.invalidateQueries({ queryKey: ['my-applications', user?.email] });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-11/12 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-[2.5rem]">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Counter Offer Received</h2>
                            <p className="text-sm text-gray-500 mt-1">{property.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Alert Banner */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-semibold text-orange-900 text-sm">Owner has sent you a counter offer</p>
                                <p className="text-orange-700 text-xs mt-1">You can either accept their counter offer or revise your offer.</p>
                            </div>
                        </div>

                        {/* Price Comparison Card */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-300">
                                <span className="text-sm font-bold text-gray-600 uppercase">Original Listing Price</span>
                                <span className="text-2xl font-black text-gray-900">
                                    ৳{originalListingPrice?.toLocaleString()}
                                    <span className="text-sm font-medium text-gray-500 ml-1">
                                        /{property.listingType === 'rent' ? 'month' : 'total'}
                                    </span>
                                </span>
                            </div>

                            {userPreviousOffer && (
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm font-bold text-gray-600 uppercase">Your Previous Offer</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        ৳{userPreviousOffer.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                                <span className="text-sm font-bold text-orange-600 uppercase">Owner's Counter Offer</span>
                                <span className="text-3xl font-black text-orange-600">
                                    ৳{ownerCounterOffer?.toLocaleString()}
                                    <span className="text-sm font-medium text-orange-500 ml-1">
                                        /{property.listingType === 'rent' ? 'month' : 'total'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={handleReviseClick}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-all shadow-lg"
                            >
                                <Edit size={18} />
                                Revise Offer
                            </button>
                            <button
                                onClick={handleAcceptCounter}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                            >
                                <Handshake size={18} />
                                Accept Counter Offer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revise Offer Modal */}
            <ReviseOfferModal
                isOpen={showReviseModal}
                onClose={handleReviseModalClose}
                application={application}
            />
        </>
    );
};

export default CounterOfferModal;

