import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, DollarSign, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import { showToast } from '../../Utilities/ToastMessage';
import { useQueryClient } from '@tanstack/react-query';

const ReviseOfferModal = ({ isOpen, onClose, application }) => {
    const { user } = useAuth();
    const axios = useAxios();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const property = application?.property;
    
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            proposedPrice: application?.proposedPrice || property?.price || ''
        }
    });

    // Auto-fill price when modal opens
    useEffect(() => {
        if (isOpen && application) {
            const priceToUse = application.proposedPrice || property?.price || '';
            setValue('proposedPrice', priceToUse);
        }
    }, [isOpen, application, property?.price, setValue]);

    if (!isOpen || !application || !property) return null;

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            const token = await user.getIdToken();

            // Revise offer by updating the application with new price and setting status back to pending
            await axios.patch(`/application/${application._id}/revise`, {
                proposedPrice: Number(data.proposedPrice)
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            showToast('Offer revised successfully!', 'success');
            reset();
            onClose();
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['my-applications', user?.email] });
            queryClient.invalidateQueries({ queryKey: ['property-applications', property._id] });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to revise offer';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-11/12 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-[2.5rem]">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Revise Your Offer</h2>
                        <p className="text-sm text-gray-500 mt-1">{property.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Property Info */}
                    <div className="bg-gray-50 rounded-md p-4 border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-500 uppercase">Original Listing Price</span>
                            <span className="text-xl font-black text-gray-900">
                                ৳{property.price?.toLocaleString()}
                                <span className="text-sm font-medium text-gray-400">
                                    /{property.listingType === 'rent' ? 'month' : 'total'}
                                </span>
                            </span>
                        </div>
                        {application.proposedPrice && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-sm font-bold text-gray-500 uppercase">Your Previous Offer</span>
                                <span className="text-lg font-bold text-blue-600">
                                    ৳{application.proposedPrice.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {application.status === 'counter' && application.proposedPrice && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-sm font-bold text-gray-500 uppercase">Owner's Counter Offer</span>
                                <span className="text-lg font-bold text-orange-600">
                                    ৳{application.proposedPrice.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Proposed Price */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <DollarSign size={16} className="text-orange-500" />
                            Your New Offer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder={`Enter your offer (${property.listingType === 'rent' ? 'per month' : 'total'})`}
                            {...register("proposedPrice", {
                                required: "Price is required",
                                min: {
                                    value: 1,
                                    message: "Price must be greater than 0"
                                }
                            })}
                            className="w-full bg-white border border-gray-200 rounded-md px-4 py-3 text-gray-800 focus:border-orange-500 outline-none transition-all"
                        />
                        {errors.proposedPrice && (
                            <p className="text-red-500 text-xs mt-1">{errors.proposedPrice.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                            Enter your revised offer price
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md font-bold uppercase text-xs tracking-wider hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-md font-bold uppercase text-xs tracking-wider hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Revising...
                                </>
                            ) : (
                                'Revise Offer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviseOfferModal;

