import React from 'react';
import { X, Clock, User, MessageSquare } from 'lucide-react';

const BiddingHistoryModal = ({ isOpen, onClose, application }) => {
    if (!isOpen || !application) return null;

    const negotiationHistory = application.negotiationHistory || [];
    const priceHistory = application.priceHistory || [];

    const getActionIcon = (action) => {
        if (action.includes('submitted')) return <MessageSquare size={16} />;
        if (action.includes('counter') || action.includes('revised')) return <span className="text-base font-bold">৳</span>;
        if (action.includes('completed') || action.includes('accepted')) return <User size={16} />;
        if (action.includes('rejected') || action.includes('withdrawn') || action.includes('cancelled')) return <X size={16} />;
        return <Clock size={16} />;
    };

    const getActionColor = (action) => {
        if (action.includes('accepted') || action.includes('completed')) return 'text-green-600 bg-green-50';
        if (action.includes('rejected') || action.includes('withdrawn') || action.includes('cancelled')) return 'text-red-600 bg-red-50';
        if (action.includes('counter') || action.includes('revised')) return 'text-blue-600 bg-blue-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg w-11/12 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Bidding History</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Property Info */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">{application.property?.title || 'Property'}</h3>
                        <div className="text-sm text-gray-600">
                            <p>Listed Price: ৳{application.property?.price?.toLocaleString() || 'N/A'}</p>
                            <p>Your Final Offer: ৳{application.proposedPrice?.toLocaleString() || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Negotiation History */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Negotiation Timeline</h3>
                        <div className="space-y-4">
                            {negotiationHistory.length > 0 ? (
                                negotiationHistory.map((entry, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(entry.action)}`}>
                                                {getActionIcon(entry.action)}
                                            </div>
                                            {index < negotiationHistory.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-gray-900 capitalize">
                                                        {entry.action.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>By: {entry.actor === 'seeker' ? 'You' : entry.actor === 'owner' ? 'Property Owner' : 'System'}</p>
                                                    {entry.proposedPrice && (
                                                        <p className="font-semibold text-blue-600 mt-1">
                                                            Proposed Price: ৳{entry.proposedPrice.toLocaleString()}
                                                        </p>
                                                    )}
                                                    {entry.message && (
                                                        <p className="mt-2 italic">"{entry.message}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No negotiation history available</p>
                            )}
                        </div>
                    </div>

                    {/* Price History */}
                    {priceHistory.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Price Changes</h3>
                            <div className="space-y-2">
                                {priceHistory.map((entry, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-gray-900">
                                                ৳{entry.price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                by {entry.setBy === 'seeker' ? 'You' : entry.setBy === 'owner' ? 'Owner' : 'System'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(entry.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BiddingHistoryModal;


