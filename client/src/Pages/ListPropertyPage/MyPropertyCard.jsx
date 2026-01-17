import React, { useState } from 'react';
import { MapPin, MessageSquare, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import EditPropertyModal from './EditPropertyModal';
import ApplicationManagementModal from './ApplicationManagementModal';
import { useQueryClient } from '@tanstack/react-query';
import { getPropertyStatusDisplay, getPropertyStatusColor } from '../../Utilities/StatusDisplay';

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


    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group flex flex-col md:flex-row">
                {/* Image Section - Left */}
                <div className="relative w-72 flex-shrink-0 p-4">
                    <div className="relative w-full h-40 overflow-hidden bg-gray-100 rounded-lg">
                        <img
                            src={images?.[0] || "https://via.placeholder.com/400"}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                            <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm border ${getPropertyStatusColor(status)}`}>
                                {getPropertyStatusDisplay(status)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section - Middle */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-2">
                                {title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                                <span className="line-clamp-1">{address?.street || 'Address not available'}</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-gray-900">
                                ৳{price?.toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                /{listingType === 'rent' ? 'month' : 'total'}
                            </span>
                        </div>
                    </div>

                    {/* Request Count - Clickable */}
                    <button
                        onClick={() => setIsApplicationModalOpen(true)}
                        className={`w-fit flex items-center justify-center gap-1.5 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                            requestsCount > 0
                                ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <MessageSquare size={16} />
                        <span>{requestsCount || 0} Request{requestsCount !== 1 ? 's' : ''}</span>
                    </button>
                </div>

                {/* Actions Section - Right */}
                <div className="p-4 flex flex-col gap-2 md:border-l md:border-t-0 border-t border-gray-100 justify-center">
                    <button
                        onClick={() => navigate(`/property-details/${_id}`)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-all text-sm font-semibold"
                        title="View Property"
                    >
                        <Eye size={16} />
                        <span>View</span>
                    </button>

                    {status === 'active' && (
                        <button
                            onClick={handleToggleVisibility}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-all text-sm font-semibold"
                            title="Hide from marketplace"
                        >
                            <EyeOff size={16} />
                            <span>Hide</span>
                        </button>
                    )}

                    {status === 'hidden' && (
                        <button
                            onClick={handleToggleVisibility}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all text-sm font-semibold"
                            title="Show on marketplace"
                        >
                            <Eye size={16} />
                            <span>Show</span>
                        </button>
                    )}

                    {/* Edit button - disabled for deal-in-progress/sold/rented */}
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        disabled={['deal-in-progress', 'sold', 'rented'].includes(status)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        title={['deal-in-progress', 'sold', 'rented'].includes(status) 
                            ? `Cannot edit property that is ${status}` 
                            : "Edit Property"}
                    >
                        <Edit3 size={16} />
                        <span>Edit</span>
                    </button>

                    {/* Delete button - disabled for deal-in-progress/sold/rented */}
                    <button
                        onClick={handleDelete}
                        disabled={['deal-in-progress', 'sold', 'rented'].includes(status)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        title={['deal-in-progress', 'sold', 'rented'].includes(status) 
                            ? `Cannot delete property that is ${status}. Please complete or cancel the deal first.` 
                            : "Delete Property"}
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
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
