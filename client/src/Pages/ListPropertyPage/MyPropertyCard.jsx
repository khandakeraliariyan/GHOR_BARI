import React, { useState } from 'react';
import { MapPin, MessageSquare, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import EditPropertyModal from './EditPropertyModal';
import ApplicationManagementModal from './ApplicationManagementModal';
import { useQueryClient } from '@tanstack/react-query';

const MyPropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const axios = useAxios();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    const {
        _id,
        title,
        address,
        price,
        listingType,
        images,
        status,
        requestsCount
    } = property || {};

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = await user.getIdToken();
                await axios.delete(`/property/${_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                await queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });

                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your property has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#f97316'
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Failed to delete property',
                    icon: 'error',
                    confirmButtonColor: '#f97316'
                });
            }
        }
    };

    const handleEditSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });
    };

    const handleToggleVisibility = async () => {
        const result = await Swal.fire({
            title: status === 'active' ? 'Hide Property?' : 'Show Property?',
            text: status === 'active' 
                ? 'This will hide your property from the marketplace. You can show it again anytime.'
                : 'This will make your property visible on the marketplace.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#6b7280',
            confirmButtonText: status === 'active' ? 'Yes, Hide it' : 'Yes, Show it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const token = await user.getIdToken();
                await axios.patch(`/property/${_id}/visibility`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                await queryClient.invalidateQueries({ queryKey: ['my-properties', user?.email] });

                Swal.fire({
                    title: 'Success!',
                    text: `Property ${status === 'active' ? 'hidden' : 'shown'} successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#f97316'
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Failed to toggle visibility',
                    icon: 'error',
                    confirmButtonColor: '#f97316'
                });
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'hidden':
                return 'bg-gray-100 text-gray-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'in_progress':
                return 'bg-blue-100 text-blue-700';
            case 'sold':
            case 'rented':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-orange-50 transition-all group">
                {/* Image Section - Top */}
                <div className="relative w-full h-56 overflow-hidden">
                    <img
                        src={images?.[0] || "https://via.placeholder.com/400"}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(status)}`}>
                            {status || 'Pending'}
                        </div>
                    </div>
                </div>

                {/* Details Section - Middle */}
                <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                        <MapPin size={14} className="text-orange-500" />
                        <span className="line-clamp-1">{address?.street}</span>
                    </div>

                    <div className="text-lg font-black text-gray-900 mb-4">
                        ৳{price?.toLocaleString()}
                        <span className="text-sm font-medium text-gray-400">
                            /{listingType === 'rent' ? 'month' : 'total'}
                        </span>
                    </div>

                    {/* Request Count - Clickable */}
                    <button
                        onClick={() => {
                            console.log('Opening application modal for property:', property);
                            setIsApplicationModalOpen(true);
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                            requestsCount > 0
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                                : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <MessageSquare size={16} />
                        {requestsCount || 0} Request{requestsCount !== 1 ? 's' : ''}
                    </button>
                </div>

                {/* Actions Section - Bottom */}
                <div className="px-5 pb-5 pt-0 flex gap-2">
                    <button
                        onClick={() => navigate(`/property-details/${_id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Eye size={14} /> View
                    </button>

                    {status === 'active' && (
                        <button
                            onClick={handleToggleVisibility}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all font-bold text-[10px] uppercase tracking-wider"
                            title="Hide from marketplace"
                        >
                            <EyeOff size={14} />
                        </button>
                    )}

                    {status === 'hidden' && (
                        <button
                            onClick={handleToggleVisibility}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-[10px] uppercase tracking-wider"
                            title="Show on marketplace"
                        >
                            <Eye size={14} />
                        </button>
                    )}

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Edit3 size={14} />
                    </button>

                    <button
                        onClick={handleDelete}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <EditPropertyModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                property={property}
                onSuccess={handleEditSuccess}
            />

            {/* Application Management Modal */}
            <ApplicationManagementModal
                isOpen={isApplicationModalOpen}
                onClose={() => setIsApplicationModalOpen(false)}
                property={property}
            />
        </>
    );
};

export default MyPropertyCard;
