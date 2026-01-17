import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import useAuth from '../../Hooks/useAuth';
import useAxios from '../../Hooks/useAxios';
import { MapPin, Eye, Loader2, Clock, CheckCircle, XCircle, MessageSquare, DollarSign, LogOut, Edit, Handshake } from 'lucide-react';
import Swal from 'sweetalert2';
import { showToast } from '../../Utilities/ToastMessage';
import ReviseOfferModal from './ReviseOfferModal';

const MyRequestedProperties = () => {
    const { user } = useAuth();
    const axios = useAxios();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [reviseModalOpen, setReviseModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

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
                <p class="text-left mt-4 text-sm text-gray-600">Accepting this will close the deal and the property will be marked as in progress.</p>
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
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to accept counter offer', 'error');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'counter':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'accepted':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'withdrawn':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'completed':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={14} />;
            case 'counter':
                return <MessageSquare size={14} />;
            case 'accepted':
                return <CheckCircle size={14} />;
            case 'rejected':
                return <XCircle size={14} />;
            case 'completed':
                return <CheckCircle size={14} />;
            default:
                return <Clock size={14} />;
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'pending':
                return 'Your application is pending review by the property owner.';
            case 'counter':
                return 'The owner has sent you a counter offer. You can accept it to close the deal or revise your offer.';
            case 'accepted':
                return 'Congratulations! Your application has been accepted.';
            case 'rejected':
                return 'Your application has been rejected by the property owner.';
            case 'withdrawn':
                return 'You have withdrawn this application.';
            case 'completed':
                return 'This deal has been completed successfully.';
            case 'cancelled':
                return 'This deal has been cancelled.';
            default:
                return '';
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
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all group flex flex-row"
                                >
                                    {/* Image Section - Left */}
                                    <div className="relative w-72 flex-shrink-0 p-4">
                                        <div className="relative w-full h-40 overflow-hidden bg-gray-100 rounded-lg">
                                            <img
                                                src={property.images?.[0] || "https://via.placeholder.com/400"}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <div className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider shadow-sm border flex items-center gap-1 ${getStatusColor(application.status)}`}>
                                                    {getStatusIcon(application.status)}
                                                    {application.status}
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
                                                            <div className="flex items-baseline gap-1 justify-end">
                                                                <DollarSign size={16} className="text-blue-600" />
                                                                <span className="text-xl font-black text-blue-600">
                                                                    ৳{application.proposedPrice.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Message - Compact */}
                                            <div className={`p-2.5 rounded-md border text-xs font-medium ${
                                                application.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                                                application.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                application.status === 'counter' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                <span className="line-clamp-2">{getStatusMessage(application.status)}</span>
                                            </div>
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
                                    <div className="p-4 flex flex-col gap-2 border-l border-gray-100 justify-center">
                                        <button
                                            onClick={() => navigate(`/property-details/${property._id}`)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-all text-sm font-semibold"
                                        >
                                            <Eye size={16} />
                                            <span>View</span>
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
        </>
    );
};

export default MyRequestedProperties;
