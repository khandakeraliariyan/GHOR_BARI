import React, { useState } from 'react';
import { MapPin, MessageSquare, Edit3, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import EditPropertyModal from './EditPropertyModal';
import { useQueryClient } from '@tanstack/react-query';

const MyPropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const axios = useAxios();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Optional chaining and default values for future-proofing
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

                // Invalidate and refetch
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

    return (
        <>
            <div className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-xl hover:shadow-orange-50 transition-all group">
                {/* Image Section */}
                <div className="relative w-full md:w-64 h-44 overflow-hidden rounded-2xl">
                    <img
                        src={images?.[0] || "https://via.placeholder.com/400"}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-orange-600'
                        }`}>
                        {status || 'Pending'}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-orange-500 transition-colors">
                            {title}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                            <MapPin size={14} className="text-orange-500" />
                            <span>{address?.street}</span>
                        </div>

                        <div className="text-lg font-black text-gray-900">
                            ৳{price?.toLocaleString()}
                            <span className="text-sm font-medium text-gray-400">
                                /{listingType === 'rent' ? 'month' : 'total'}
                            </span>
                        </div>
                    </div>

                    {/* Future Proof Request Counter - static for now, will be updated later*/}
                    <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <MessageSquare size={16} className="text-orange-400" />
                            <span className="text-xs font-bold">
                                {requestsCount || 0} <span className="font-medium">Total Requests</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Section - 3 Buttons */}
                <div className="flex md:flex-col gap-2 justify-center">
                    <button
                        onClick={() => navigate(`/property-details/${_id}`)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Eye size={14} /> View
                    </button>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Edit3 size={14} /> Edit
                    </button>

                    <button
                        onClick={handleDelete}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Trash2 size={14} /> Delete
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
        </>
    );
};

export default MyPropertyCard;
