import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import useAuth from '../../Hooks/useAuth';
import useAxios from '../../Hooks/useAxios';
import { MapPin, Eye, Loader2, Clock, CheckCircle, XCircle, MessageSquare, LogOut, Edit, Handshake, History, CheckCircle2, Ban } from 'lucide-react';
import Swal from 'sweetalert2';
import { showToast } from '../../Utilities/ToastMessage';
import ReviseOfferModal from './ReviseOfferModal';
import BiddingHistoryModal from './BiddingHistoryModal';
import { 
    getApplicationStatusDisplay, 
    getApplicationStatusMessage, 
    getApplicationStatusColor,
    isActiveApplicationStatus 
} from '../../Utilities/StatusDisplay';

const MyRequestedProperties = () => {
    const { user } = useAuth();
    const axios = useAxios();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [reviseModalOpen, setReviseModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [biddingHistoryModalOpen, setBiddingHistoryModalOpen] = useState(false);
    const [selectedApplicationForHistory, setSelectedApplicationForHistory] = useState(null);

    // Fetch User Applications
    const { data: applications = [], isLoading } = useQuery({
        queryKey: ['my-applications', user?.email],
        queryFn: async () => {
            if (!user) return [];

            const token = await user.getIdToken();

            const res = await axios.get(`/my-applications?email=${user.email}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data;
        },
    });

    const handleWithdraw = async (application) => {
        const result = await Swal.fire({
            title: 'Withdraw Application?',
            html: `
                <p class="text-left mb-4">Are you sure you want to withdraw this application?</p>
                <div class="text-left space-y-2">
                    <p><strong>Property:</strong> ${application.property?.title || 'N/A'}</p>
                </div>
                <p class="text-left mt-4 text-sm text-gray-600">You can submit a new application later if needed.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Withdraw',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = await user.getIdToken();
                await axios.patch(`/application/${application._id}/withdraw`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                showToast('Application withdrawn successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['my-applications', user?.email] });
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to withdraw application', 'error');
            }
        }
    };

    const handleAcceptCounter = async (application) => {
        const result = await Swal.fire({
            title: 'Accept Counter Offer?',
            html: `
                <p class="text-left mb-4">Are you sure you want to accept the owner's counter offer?</p>
                <div class="text-left space-y-2">
                    <p><strong>Property:</strong> ${application.property?.title || 'N/A'}</p>
                    <p><strong>Owner's Counter Offer:</strong> ৳${application.proposedPrice?.toLocaleString() || 'N/A'}</p>
                    <p><strong>Original Listing Price:</strong> ৳${application.property?.price?.toLocaleString() || 'N/A'}</p>
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
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to accept counter offer', 'error');
            }
        }
    };

    const handleMarkDealCompleted = async (application) => {
        const property = application.property;
        if (!property) return;

        const actionTextLower = property.listingType === 'sale' ? 'sold' : 'rented';

        const result = await Swal.fire({
            title: 'Mark Deal as Completed?',
            html: `
                <p class="text-left mb-4">Are you sure you want to mark this deal as completed?</p>
                <div class="text-left space-y-2">
                    <p><strong>Property:</strong> ${property.title}</p>
                    <p><strong>Final Price:</strong> ৳${application.proposedPrice?.toLocaleString() || property.price?.toLocaleString() || 'N/A'}</p>
                </div>
                <p class="text-left mt-4 text-sm text-gray-600">This will mark the property as ${actionTextLower} and finalize the deal.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Mark as Completed',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = await user.getIdToken();
                await axios.patch(`/property/${property._id}/deal`, {
                    dealStatus: 'completed'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                showToast(`Deal marked as ${actionTextLower} successfully!`, 'success');
                queryClient.invalidateQueries({ queryKey: ['my-applications', user?.email] });
                queryClient.invalidateQueries({ queryKey: ['property', property._id] });
                queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });
            } catch (error) {
                showToast(error.response?.data?.message || `Failed to mark deal as ${actionTextLower}`, 'error');
            }
        }
    };

    const handleCancelDeal = async (application) => {
        const property = application.property;
        if (!property) return;

        const result = await Swal.fire({
            title: 'Cancel Deal?',
            html: `
                <p class="text-left mb-4">Are you sure you want to cancel this deal?</p>
                <div class="text-left space-y-2">
                    <p><strong>Property:</strong> ${property.title}</p>
                    <p><strong>Final Price:</strong> ৳${application.proposedPrice?.toLocaleString() || property.price?.toLocaleString() || 'N/A'}</p>
                </div>
                <p class="text-left mt-4 text-sm text-gray-600">This will cancel the deal and restore the property to its previous status. Your application will be marked as cancelled.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Cancel Deal',
            cancelButtonText: 'No, Keep Deal'
        });

        if (result.isConfirmed) {
            try {
                const token = await user.getIdToken();
                await axios.patch(`/property/${property._id}/deal`, {
                    dealStatus: 'cancelled'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                showToast('Deal cancelled successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['my-applications', user?.email] });
                queryClient.invalidateQueries({ queryKey: ['property', property._id] });
                queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to cancel deal', 'error');
            }
        }
    };

    const getStatusIcon = (status) => {
        // Backward compatibility: treat 'accepted' as 'deal-in-progress'
        const normalizedStatus = status === 'accepted' ? 'deal-in-progress' : status;
        
        switch (normalizedStatus) {
            case 'pending':
                return <Clock size={14} />;
            case 'counter':
                return <MessageSquare size={14} />;
            case 'deal-in-progress':
                return <Handshake size={14} />;
            case 'completed':
                return <CheckCircle size={14} />;
            case 'rejected':
                return <XCircle size={14} />;
            case 'cancelled':
                return <XCircle size={14} />;
            default:
                return <Clock size={14} />;
        }
    };

    return (
        <>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-100">
                    <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Applications...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {applications.length > 0 ? (
                        applications.map((application) => {
                            const property = application.property;
                            if (!property) return null;

                            return (
                                <div
                                    key={application._id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all group flex flex-col md:flex-row"
                                >
                                    {/* Image Section - Left */}
                                    <div className="relative w-full md:w-72 flex-shrink-0 p-4">
                                        <div className="relative w-full h-40 overflow-hidden bg-gray-100 rounded-lg">
                                            <img
                                                src={property.images?.[0] || "https://via.placeholder.com/400"}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm border flex items-center gap-1 ${getApplicationStatusColor(application.status)}`}>
                                                    {getStatusIcon(application.status)}
                                                    {getApplicationStatusDisplay(application.status, property)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Section - Middle */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                    {property.title}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                                    <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                                                    <span className="line-clamp-1">{property.address?.street || 'Address not available'}</span>
                                                </div>
                                            </div>

                                            {/* Price Comparison */}
                                            <div className="space-y-2">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Listed</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-xl font-black text-gray-700">
                                                                ৳{property.price?.toLocaleString()}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-500">
                                                                /{property.listingType === 'rent' ? 'mo' : 'total'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {application.proposedPrice && (
                                                        <div className="text-right">
                                                            <span className="text-xs text-gray-500 block">Your Offer</span>
                                                            <div className="text-xl font-black text-blue-600">
                                                                ৳{application.proposedPrice.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Message - Compact */}
                                            {(application.status && getApplicationStatusMessage(application.status, property)) && (
                                                <div className={`px-2.5 py-1 rounded-md border text-xs font-medium w-fit ${getApplicationStatusColor(application.status)}`}>
                                                    {getApplicationStatusMessage(application.status, property)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-gray-400">
                                            {new Date(application.createdAt).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions Section - Right */}
                                    <div className="p-4 flex flex-col gap-2 md:border-l md:border-t-0 border-t border-gray-100 justify-center">
                                        <button
                                            onClick={() => navigate(`/property-details/${property._id}`)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-all text-sm font-semibold"
                                        >
                                            <Eye size={16} />
                                            <span>View</span>
                                        </button>

                                        {/* Bidding History Button */}
                                        <button
                                            onClick={() => {
                                                setSelectedApplicationForHistory(application);
                                                setBiddingHistoryModalOpen(true);
                                            }}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-all text-sm font-semibold"
                                        >
                                            <History size={16} />
                                            <span>History</span>
                                        </button>

                                        {/* Accept Counter Offer button - only for counter status */}
                                        {application.status === 'counter' && (
                                            <button
                                                onClick={() => handleAcceptCounter(application)}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-all text-sm font-semibold"
                                            >
                                                <Handshake size={16} />
                                                <span>Accept</span>
                                            </button>
                                        )}

                                        {/* Mark Deal as Completed/Rented/Sold and Cancel Deal buttons - only for deal-in-progress status */}
                                        {(application.status === 'deal-in-progress' || application.status === 'accepted') && (
                                            <>
                                                <button
                                                    onClick={() => handleMarkDealCompleted(application)}
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-all text-sm font-semibold"
                                                >
                                                    <CheckCircle2 size={16} />
                                                    <span>Mark as {property?.listingType === 'sale' ? 'Sold' : 'Rented'}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleCancelDeal(application)}
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-all text-sm font-semibold"
                                                >
                                                    <Ban size={16} />
                                                    <span>Cancel Deal</span>
                                                </button>
                                            </>
                                        )}

                                        {/* Revise button - only for counter status */}
                                        {application.status === 'counter' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedApplication(application);
                                                    setReviseModalOpen(true);
                                                }}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all text-sm font-semibold"
                                            >
                                                <Edit size={16} />
                                                <span>Revise</span>
                                            </button>
                                        )}

                                        {/* Withdraw button - only for pending and counter */}
                                        {['pending', 'counter'].includes(application.status) && (
                                            <button
                                                onClick={() => handleWithdraw(application)}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-all text-sm font-semibold"
                                            >
                                                <LogOut size={16} />
                                                <span>Withdraw</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-lg">
                            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">No applications found. Start applying to properties!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Revise Offer Modal */}
            <ReviseOfferModal
                isOpen={reviseModalOpen}
                onClose={() => {
                    setReviseModalOpen(false);
                    setSelectedApplication(null);
                }}
                application={selectedApplication}
            />

            {/* Bidding History Modal */}
            <BiddingHistoryModal
                isOpen={biddingHistoryModalOpen}
                onClose={() => {
                    setBiddingHistoryModalOpen(false);
                    setSelectedApplicationForHistory(null);
                }}
                application={selectedApplicationForHistory}
            />
        </>
    );
};

export default MyRequestedProperties;
