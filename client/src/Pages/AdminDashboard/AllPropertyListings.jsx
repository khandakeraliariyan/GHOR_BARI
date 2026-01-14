import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { 
    CheckCircle, 
    Trash2, 
    ExternalLink, 
    XCircle, 
    ChevronDown, 
    Building2, 
    Inbox, 
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Home,
    Handshake,
    Clock,
    RotateCcw
} from 'lucide-react';
import Loading from '../../Components/Loading';

const AllPropertyListings = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, pending, active, rejected, rented, sold, deal-in-progress, deal-cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data: properties = [], isLoading } = useQuery({
        queryKey: ['all-properties'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/all-properties');
            return res.data;
        }
    });

    // Filter and search logic
    const filteredProperties = useMemo(() => {
        return properties.filter(prop => {
            const matchesFilter = filter === 'all' ? true : prop.status === filter;
            
            const matchesSearch = searchTerm === '' || 
                prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesFilter && matchesSearch;
        });
    }, [properties, filter, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    // Reset to page 1 when filter or search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    // Status badge colors
    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            rejected: 'bg-red-50 text-red-600 border-red-100',
            rented: 'bg-blue-50 text-blue-600 border-blue-100',
            sold: 'bg-purple-50 text-purple-600 border-purple-100',
            'deal-in-progress': 'bg-orange-50 text-orange-600 border-orange-100',
            'deal-cancelled': 'bg-gray-50 text-gray-600 border-gray-100'
        };
        return badges[status] || 'bg-gray-50 text-gray-600 border-gray-100';
    };

    // Mutation for status changes
    const statusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            return await axiosSecure.patch(`/admin/property-status/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-properties']);
            Swal.fire('Updated!', 'Property status has been changed.', 'success');
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Failed to update property status';
            Swal.fire('Error!', errorMessage, 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await axiosSecure.delete(`/admin/delete-property/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-properties']);
            Swal.fire('Deleted!', 'Property has been permanently removed.', 'success');
        }
    });

    const handleAction = (id, status) => {
        const statusLabels = {
            'active': 'approve this property',
            'rejected': 'reject this property',
            'rented': 'mark this property as rented',
            'sold': 'mark this property as sold',
            'deal-in-progress': 'mark this property as deal in progress',
            'deal-cancelled': 'cancel this deal (will restore previous status)'
        };

        const confirmMessages = {
            'active': 'This property will be approved and listed on the marketplace.',
            'rejected': 'This property will be rejected and removed from listings.',
            'rented': 'This property will be marked as rented and removed from active listings.',
            'sold': 'This property will be marked as sold and removed from active listings.',
            'deal-in-progress': 'This property will be marked as deal in progress. The previous status will be saved.',
            'deal-cancelled': 'This deal will be cancelled and the property will return to its previous status.'
        };

        Swal.fire({
            title: `Are you sure you want to ${statusLabels[status] || status}?`,
            text: confirmMessages[status] || '',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: status === 'active' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#344767',
            confirmButtonText: `Yes, ${status === 'active' ? 'Approve' : status === 'rejected' ? 'Reject' : 'Confirm'}!`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                statusMutation.mutate({ id, status });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Permanently?',
            text: "This action cannot be undone!",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    // Check if action should be available - with proper business logic
    const canApprove = (status) => ['pending', 'rejected'].includes(status);
    const canReject = (status) => ['pending', 'active'].includes(status);
    
    // Mark as Rented: Only for rent listings, and only if not already rented/sold
    const canMarkRented = (property) => {
        return property.listingType === 'rent' 
            && !['rented', 'sold'].includes(property.status)
            && ['active', 'deal-in-progress'].includes(property.status);
    };
    
    // Mark as Sold: Only for sale listings, and only if not already rented/sold
    const canMarkSold = (property) => {
        return property.listingType === 'sale' 
            && !['rented', 'sold'].includes(property.status)
            && ['active', 'deal-in-progress'].includes(property.status);
    };
    
    // Deal in Progress: Only for active or pending properties
    const canMarkDealInProgress = (status) => ['active', 'pending'].includes(status);
    
    // Cancel Deal: Only for properties currently in deal-in-progress
    const canMarkDealCancelled = (status) => status === 'deal-in-progress';

    if (isLoading) return <Loading />;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* TOP BAR */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-[#344767]">
                        <Building2 size={20} />
                    </div>
                    <h1 className="text-lg font-bold text-[#344767] uppercase tracking-tight">All Property Listings</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative min-w-[200px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={14} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-[#344767] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative group min-w-[180px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                            <ChevronDown size={14} />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-[#344767] appearance-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                            <option value="rented">Rented</option>
                            <option value="sold">Sold</option>
                            <option value="deal-in-progress">Deal in Progress</option>
                            <option value="deal-cancelled">Deal Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <table className="min-w-full text-center table-auto border-collapse" style={{ minWidth: '1400px' }}>
                    {paginatedProperties.length > 0 && (
                        <thead className="bg-[#f8f9fa]">
                            <tr className="text-[11px] uppercase text-[#344767] font-black tracking-widest border-b border-gray-200">
                                <th className="px-4 py-4 text-left border-r border-gray-200 whitespace-nowrap min-w-[200px]">Property Title</th>
                                <th className="px-4 py-4 border-r border-gray-200 whitespace-nowrap min-w-[180px]">Owner Contact</th>
                                <th className="px-4 py-4 border-r border-gray-200 whitespace-nowrap min-w-[100px]">Mode</th>
                                <th className="px-4 py-4 border-r border-gray-200 whitespace-nowrap min-w-[120px]">Category</th>
                                <th className="px-4 py-4 border-r border-gray-200 whitespace-nowrap min-w-[150px]">Price Structure</th>
                                <th className="px-4 py-4 border-r border-gray-200 whitespace-nowrap min-w-[140px]">Specifications</th>
                                <th className="px-4 py-4 border-r border-gray-200 whitespace-nowrap min-w-[100px]">Size</th>
                                <th className="px-4 py-4 border-r border-gray-200 whitespace-nowrap min-w-[140px]">Status</th>
                                <th className="px-4 py-4 whitespace-nowrap min-w-[300px]">Administrative Actions</th>
                            </tr>
                        </thead>
                    )}
                    <tbody className="divide-y divide-gray-200">
                        {paginatedProperties.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Inbox size={32} className="text-gray-400" />
                                        </div>
                                        <p className="text-[#67748e] font-bold text-sm uppercase tracking-wider mb-1">No Properties Found</p>
                                        <p className="text-gray-400 text-xs">
                                            {searchTerm ? 'Try adjusting your search terms.' : 'No properties match the selected filter.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedProperties.map(prop => (
                                <tr key={prop._id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-4 py-5 text-left border-r border-gray-200 bg-white group-hover:bg-gray-50/80 whitespace-nowrap">
                                        <span className="font-bold text-sm text-[#344767] leading-snug">{prop.title}</span>
                                    </td>
                                    <td className="px-4 py-5 text-sm font-medium text-[#67748e] border-r border-gray-200 whitespace-nowrap">
                                        {prop.owner?.email}
                                    </td>
                                    <td className="px-4 py-5 border-r border-gray-200 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                            prop.listingType === 'rent' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {prop.listingType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5 text-sm font-bold uppercase text-[#67748e] border-r border-gray-200 whitespace-nowrap">
                                        {prop.propertyType}
                                    </td>
                                    <td className="px-4 py-5 text-sm font-black text-[#344767] border-r border-gray-200 whitespace-nowrap">
                                        ৳{prop.price?.toLocaleString()}
                                        <span className="text-[10px] font-bold text-gray-400 block uppercase">
                                            {prop.listingType === 'rent' ? 'Per Month' : 'Asking Price'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5 text-sm font-bold text-[#67748e] border-r border-gray-200 whitespace-nowrap">
                                        {prop.unitCount} {prop.propertyType === 'flat' ? 'Bedrooms' : 'Floors'}
                                    </td>
                                    <td className="px-4 py-5 text-sm font-medium text-[#67748e] border-r border-gray-200 whitespace-nowrap">
                                        {prop.areaSqFt} <span className="text-[10px] font-bold">SQFT</span>
                                    </td>
                                    <td className="px-4 py-5 border-r border-gray-200 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border-2 ${getStatusBadge(prop.status)}`}>
                                            {prop.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Approve - only for pending/rejected */}
                                            {canApprove(prop.status) && (
                                                <button 
                                                    onClick={() => handleAction(prop._id, 'active')} 
                                                    className="w-9 h-9 flex items-center justify-center text-emerald-500 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all" 
                                                    title="Approve Property"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}

                                            {/* Details - always available */}
                                            <button 
                                                onClick={() => navigate(`/admin-dashboard/property-details/${prop._id}`)} 
                                                className="w-9 h-9 flex items-center justify-center text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all" 
                                                title="View Details"
                                            >
                                                <ExternalLink size={18} />
                                            </button>

                                            {/* Reject - only for pending/active */}
                                            {canReject(prop.status) && (
                                                <button 
                                                    onClick={() => handleAction(prop._id, 'rejected')} 
                                                    className="w-9 h-9 flex items-center justify-center text-amber-500 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all" 
                                                    title="Reject Property"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}

                                            {/* Mark as Rented - only for rent listings that are active or deal-in-progress */}
                                            {canMarkRented(prop) && (
                                                <button 
                                                    onClick={() => handleAction(prop._id, 'rented')} 
                                                    className="w-9 h-9 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all" 
                                                    title="Mark as Rented"
                                                >
                                                    <Home size={18} />
                                                </button>
                                            )}

                                            {/* Mark as Sold - only for sale listings that are active or deal-in-progress */}
                                            {canMarkSold(prop) && (
                                                <button 
                                                    onClick={() => handleAction(prop._id, 'sold')} 
                                                    className="w-9 h-9 flex items-center justify-center text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all" 
                                                    title="Mark as Sold"
                                                >
                                                    <Handshake size={18} />
                                                </button>
                                            )}

                                            {/* Deal in Progress - only for active or pending */}
                                            {canMarkDealInProgress(prop.status) && (
                                                <button 
                                                    onClick={() => handleAction(prop._id, 'deal-in-progress')} 
                                                    className="w-9 h-9 flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all" 
                                                    title="Mark as Deal in Progress"
                                                >
                                                    <Clock size={18} />
                                                </button>
                                            )}

                                            {/* Cancel Deal - only for deal-in-progress */}
                                            {canMarkDealCancelled(prop.status) && (
                                                <button 
                                                    onClick={() => handleAction(prop._id, 'deal-cancelled')} 
                                                    className="w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all" 
                                                    title="Cancel Deal (Restore Previous Status)"
                                                >
                                                    <RotateCcw size={18} />
                                                </button>
                                            )}

                                            <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

                                            {/* Hard Delete - always available */}
                                            <button 
                                                onClick={() => handleDelete(prop._id)} 
                                                className="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all" 
                                                title="Hard Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {filteredProperties.length > itemsPerPage && (
                <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-white">
                    <div className="text-sm text-[#67748e] font-medium">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-[#344767] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="First Page"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-[#344767] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Previous Page"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-4 py-2 text-sm font-bold text-[#344767]">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-[#344767] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Next Page"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-[#344767] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Last Page"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllPropertyListings;

