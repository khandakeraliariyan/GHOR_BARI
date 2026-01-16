import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, User, DollarSign, MessageSquare, CheckCircle, XCircle, Clock, Loader2, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import { showToast } from '../../Utilities/ToastMessage';

const ApplicationManagementModal = ({ isOpen, onClose, property }) => {
    // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
    const { user } = useAuth();
    const axios = useAxios();
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState(null);

    // Fetch applications for this property
    const { data: applications = [], isLoading, error } = useQuery({
        queryKey: ['property-applications', property?._id],
        enabled: isOpen && !!property?._id && !!user,
        queryFn: async () => {
            if (!user || !property?._id) {
                console.error('Missing user or property._id:', { user: !!user, propertyId: property?._id });
                return [];
            }
            
            try {
                const token = await user.getIdToken();
                // Ensure propertyId is a string - handle both ObjectId and string formats
                const propertyId = property?._id?.toString ? property._id.toString() : String(property?._id || '');
                
                if (!propertyId || propertyId === 'undefined' || propertyId === 'null' || !propertyId.trim()) {
                    const errorMsg = 'Invalid property ID';
                    console.error(errorMsg, property);
                    throw new Error(errorMsg);
                }
                
                console.log('Fetching applications for property:', propertyId);
                
                const res = await axios.get(`/property/${propertyId}/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log('Applications response:', res.data);
                
                if (!res.data) {
                    console.warn('No data in response');
                    return [];
                }
                
                return Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                console.error('Error fetching applications:', err);
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    propertyId: property?._id,
                    property: property
                });
                // Don't show toast here - let the error display handle it
                throw err;
            }
        },
        retry: 1,
        onError: (err) => {
            console.error('Query error fetching applications:', err);
        }
    });

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
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleAccept = async (application) => {
        const result = await Swal.fire({
            title: 'Accept Application?',
            html: `
                <p class="text-left mb-4">Are you sure you want to accept this application?</p>
                <div class="text-left space-y-2">
                    <p><strong>Applicant:</strong> ${application.seeker.name}</p>
                    <p><strong>Proposed Price:</strong> ${application.proposedPrice ? `৳${application.proposedPrice.toLocaleString()}` : 'Listed Price'}</p>
                </div>
                <p class="text-left mt-4 text-sm text-gray-600">This will reject all other pending applications for this property.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Accept',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setProcessingId(application._id);
                const token = await user.getIdToken();
                await axios.patch(`/application/${application._id}`, {
                    status: 'accepted'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                showToast('Application accepted successfully!', 'success');
                queryClient.invalidateQueries({ queryKey: ['property-applications', property._id] });
                queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to accept application', 'error');
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleReject = async (application) => {
        const result = await Swal.fire({
            title: 'Reject Application?',
            html: `
                <p class="text-left mb-4">Are you sure you want to reject this application?</p>
                <div class="text-left space-y-2">
                    <p><strong>Applicant:</strong> ${application.seeker.name}</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Reject',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setProcessingId(application._id);
                const token = await user.getIdToken();
                await axios.patch(`/application/${application._id}`, {
                    status: 'rejected'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                showToast('Application rejected', 'success');
                queryClient.invalidateQueries({ queryKey: ['property-applications', property._id] });
                queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to reject application', 'error');
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleCounter = async (application) => {
        const { value: proposedPrice } = await Swal.fire({
            title: 'Counter Offer',
            html: `
                <p class="text-left mb-4">Enter your counter offer price:</p>
                <p class="text-left text-sm text-gray-600 mb-2">Current Listed Price: ৳${property.price?.toLocaleString()}</p>
                <p class="text-left text-sm text-gray-600 mb-4">Applicant's Offer: ${application.proposedPrice ? `৳${application.proposedPrice.toLocaleString()}` : 'Listed Price'}</p>
            `,
            input: 'number',
            inputLabel: 'Proposed Price',
            inputPlaceholder: `Enter price (${property.listingType === 'rent' ? 'per month' : 'total'})`,
            inputValue: application.proposedPrice || property.price,
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Send Counter Offer',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value || value <= 0) {
                    return 'Please enter a valid price';
                }
                return null;
            }
        });

        if (proposedPrice) {
            try {
                setProcessingId(application._id);
                const token = await user.getIdToken();
                await axios.patch(`/application/${application._id}`, {
                    status: 'counter',
                    proposedPrice: Number(proposedPrice)
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                showToast('Counter offer sent successfully!', 'success');
                queryClient.invalidateQueries({ queryKey: ['property-applications', property._id] });
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to send counter offer', 'error');
            } finally {
                setProcessingId(null);
            }
        }
    };

    // Now handle conditional rendering AFTER all hooks are called
    if (!isOpen) return null;
    
    // Validate property object
    if (!property) {
        console.error('ApplicationManagementModal: Property is null or undefined');
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-11/12 max-w-2xl mx-auto p-6 shadow-2xl">
                    <div className="flex flex-col items-center justify-center py-10">
                        <XCircle className="text-red-500 mb-4" size={40} />
                        <p className="font-bold text-red-500 mb-2">Invalid Property Data</p>
                        <p className="text-sm text-gray-500 text-center mb-4">Property information is missing.</p>
                        <button onClick={onClose} className="px-4 py-2 bg-orange-500 text-white rounded-md">Close</button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!property._id) {
        console.error('ApplicationManagementModal: Property._id is missing', property);
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-11/12 max-w-2xl mx-auto p-6 shadow-2xl">
                    <div className="flex flex-col items-center justify-center py-10">
                        <XCircle className="text-red-500 mb-4" size={40} />
                        <p className="font-bold text-red-500 mb-2">Missing Property ID</p>
                        <p className="text-sm text-gray-500 text-center mb-4">Property ID is missing. Please refresh the page.</p>
                        <button onClick={onClose} className="px-4 py-2 bg-orange-500 text-white rounded-md">Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const activeApplications = applications.filter(app => ['pending', 'counter', 'accepted'].includes(app.status));
    const otherApplications = applications.filter(app => !['pending', 'counter', 'accepted'].includes(app.status));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-11/12 mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-lg z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Manage Applications</h2>
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
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Applications...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <XCircle className="text-red-500 mb-4" size={40} />
                            <p className="font-bold text-red-500 mb-2">Error Loading Applications</p>
                            <p className="text-sm text-gray-500 text-center px-4 mb-4">
                                {error.response?.data?.message || error.message || 'Failed to load applications'}
                            </p>
                            <button
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['property-applications', property._id] })}
                                className="px-4 py-2 bg-orange-500 text-white rounded-md font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Active Applications */}
                            {activeApplications.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Active Applications ({activeApplications.length})</h3>
                                    <div className="space-y-4">
                                        {activeApplications.map((application) => (
                                            <div
                                                key={application._id}
                                                className="bg-gray-50 rounded-md p-5 border border-gray-200"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-12 h-12 rounded-md bg-orange-100 flex items-center justify-center overflow-hidden">
                                                                {application.seeker.photoURL ? (
                                                                    <img src={application.seeker.photoURL} alt={application.seeker.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User size={20} className="text-orange-500" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">{application.seeker.name}</h4>
                                                                <p className="text-xs text-gray-500">{application.seeker.email}</p>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(application.status)}`}>
                                                                {application.status}
                                                            </div>
                                                        </div>

                                                        {application.proposedPrice && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <DollarSign size={16} className="text-blue-600" />
                                                                <span className="text-sm font-bold text-gray-700">
                                                                    Proposed: ৳{application.proposedPrice.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {application.message && (
                                                            <div className="flex items-start gap-2 mb-3">
                                                                <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                                                                <p className="text-sm text-gray-600">{application.message}</p>
                                                            </div>
                                                        )}

                                                        <p className="text-xs text-gray-400">
                                                            Applied: {new Date(application.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        {application.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAccept(application)}
                                                                    disabled={processingId === application._id}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-md font-bold text-xs uppercase tracking-wider hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                                                >
                                                                    {processingId === application._id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle size={14} />
                                                                    )}
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCounter(application)}
                                                                    disabled={processingId === application._id}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                                                >
                                                                    <Send size={14} />
                                                                    Counter
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(application)}
                                                                    disabled={processingId === application._id}
                                                                    className="px-4 py-2 bg-red-600 text-white rounded-md font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={14} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {application.status === 'counter' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAccept(application)}
                                                                    disabled={processingId === application._id}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-md font-bold text-xs uppercase tracking-wider hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                                                >
                                                                    {processingId === application._id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle size={14} />
                                                                    )}
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(application)}
                                                                    disabled={processingId === application._id}
                                                                    className="px-4 py-2 bg-red-600 text-white rounded-md font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={14} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {application.status === 'accepted' && (
                                                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-md font-bold text-xs uppercase tracking-wider text-center">
                                                                Accepted
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Other Applications */}
                            {otherApplications.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Other Applications ({otherApplications.length})</h3>
                                    <div className="space-y-3">
                                        {otherApplications.map((application) => (
                                            <div
                                                key={application._id}
                                                className="bg-gray-50 rounded-md p-4 border border-gray-200 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {application.seeker.photoURL ? (
                                                            <img src={application.seeker.photoURL} alt={application.seeker.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={16} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{application.seeker.name}</p>
                                                        <p className="text-xs text-gray-500">{new Date(application.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(application.status)}`}>
                                                    {application.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {applications.length === 0 && (
                                <div className="text-center py-20">
                                    <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">No applications yet</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationManagementModal;

