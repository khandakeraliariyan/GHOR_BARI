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
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">My Requested Properties</h2>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Applications...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.length > 0 ? (
                        applications.map((application) => {
                            const property = application.property;
                            if (!property) return null;

                            return (
                                <div
                                    key={application._id}
                                    className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-orange-50 transition-all group"
                                >
                                    {/* Image Section - Top */}
                                    <div className="relative w-full h-56 overflow-hidden">
                                        <img
                                            src={property.images?.[0] || "https://via.placeholder.com/400"}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border flex items-center gap-1 ${getStatusColor(application.status)}`}>
                                                {getStatusIcon(application.status)}
                                                {application.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Section - Middle */}
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">
                                            {property.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                                            <MapPin size={14} className="text-orange-500" />
                                            <span className="line-clamp-1">{property.address?.street}</span>
                                        </div>

                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="text-lg font-black text-gray-900">
                                                ৳{property.price?.toLocaleString()}
                                                <span className="text-sm font-medium text-gray-400">
                                                    /{property.listingType === 'rent' ? 'month' : 'total'}
                                                </span>
                                            </div>
                                            {application.proposedPrice && (
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <DollarSign size={16} />
                                                    <span className="text-sm font-bold">
                                                        Your Offer: ৳{application.proposedPrice.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {application.message && (
                                            <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-start gap-2">
                                                    <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                                                    <p className="text-sm text-gray-600">{application.message}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Message */}
                                        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-xs font-medium text-blue-700">
                                                {getStatusMessage(application.status)}
                                            </p>
                                        </div>

                                        <div className="text-xs text-gray-400 mb-4">
                                            Applied: {new Date(application.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Actions Section - Bottom */}
                                    <div className="px-5 pb-5 pt-0 flex gap-2">
                                        <button
                                            onClick={() => navigate(`/property-details/${property._id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider"
                                        >
                                            <Eye size={14} /> View Property
                                        </button>

                                        {/* Accept Counter Offer button - only for counter status */}
                                        {application.status === 'counter' && (
                                            <button
                                                onClick={() => handleAcceptCounter(application)}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all font-bold text-[10px] uppercase tracking-wider"
                                            >
                                                <Handshake size={14} /> Accept
                                            </button>
                                        )}

                                        {/* Revise button - only for counter status */}
                                        {application.status === 'counter' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedApplication(application);
                                                    setReviseModalOpen(true);
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-[10px] uppercase tracking-wider"
                                            >
                                                <Edit size={14} /> Revise
                                            </button>
                                        )}

                                        {/* Withdraw button - only for pending and counter */}
                                        {['pending', 'counter'].includes(application.status) && (
                                            <button
                                                onClick={() => handleWithdraw(application)}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-[10px] uppercase tracking-wider"
                                            >
                                                <LogOut size={14} /> Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2rem]">
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
        </div>
    );
};

export default MyRequestedProperties;
