import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../Hooks/useAxios";
import MapPicker from "../../Components/MapPicker";
import useAuth from "../../Hooks/useAuth";
import {
    X, Layers, CheckCircle, Info, Upload, Image as ImageIcon, Loader2, MapPin
} from "lucide-react";
import { uploadImageToImgBB } from "../../Utilities/UploadImage";
import { showToast } from "../../Utilities/ToastMessage";
import Swal from 'sweetalert2';

const AMENITIES = [
    "Air Conditioning", "Parking Space", "24/7 Security", "Elevator",
    "Backup Generator", "Gas Connection", "Water Supply", "Balcony",
    "CCTV", "Fire Safety", "Playground", "Gym"
];

const EditPropertyModal = ({ isOpen, onClose, property, onSuccess }) => {
    const { user } = useAuth();
    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();
    const [mapView, setMapView] = useState({ center: [23.6850, 90.3563], zoom: 7 });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const axios = useAxios();

    // Initialize form when property changes
    useEffect(() => {
        if (property && isOpen) {
            reset({
                price: property.price || "",
                unitCount: property.unitCount || "",
                bathrooms: property.bathrooms || "",
                areaSqFt: property.areaSqFt || "",
                overview: property.overview || "",
                amenities: property.amenities || [],
                coordinates: property.location || { lat: 23.6850, lng: 90.3563 }
            });
            setExistingImages(property.images || []);
            setSelectedFiles([]);
            if (property.location) {
                setMapView({ center: [property.location.lat, property.location.lng], zoom: 15 });
                setValue("coordinates", property.location);
            }
        }
    }, [property, isOpen, reset, setValue]);

    const watchCoords = watch("coordinates");

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        if (!watchCoords) return showToast("Please pin your location on the map", "error");
        
        // Ensure at least one image remains
        if (existingImages.length === 0 && selectedFiles.length === 0) {
            return showToast("Please keep at least one image", "error");
        }

        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Confirm Update',
            text: 'Are you sure you want to update this property?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        try {
            const uploadedUrls = [];
            
            // Upload new files
            for (let file of selectedFiles) {
                const url = await uploadImageToImgBB(file);
                uploadedUrls.push(url);
            }

            // Combine existing and new images
            const allImages = [...existingImages, ...uploadedUrls];

            const token = await user?.getIdToken();
            const payload = {
                price: Number(data.price),
                unitCount: Number(data.unitCount),
                bathrooms: Number(data.bathrooms),
                areaSqFt: Number(data.areaSqFt),
                images: allImages,
                overview: data.overview,
                amenities: data.amenities || [],
                location: {
                    lat: data.coordinates.lat,
                    lng: data.coordinates.lng
                }
            };

            await axios.put(`/property/${property._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Property has been updated successfully.',
                icon: 'success',
                confirmButtonColor: '#f97316'
            });
            
            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update property',
                icon: 'error',
                confirmButtonColor: '#f97316'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const labelStyle = "block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider";
    const inputStyle = (name) => `w-full bg-white border ${errors[name] ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-gray-800 focus:border-orange-500 outline-none transition-all`;
    const sectionTitle = "text-lg font-black text-gray-900 mb-6 flex items-center gap-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-black text-gray-900">Edit Property</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    {/* Specifications */}
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                        <h3 className={sectionTitle}><Layers className="text-orange-500" size={20} /> Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 block">
                                    {property?.listingType === "rent" ? "Monthly Rent" : "Asking Price"} (BDT)
                                </label>
                                <input
                                    type="number"
                                    {...register("price", { required: "Price is required", min: { value: 1, message: "Must be positive" } })}
                                    className="w-full bg-transparent border-none text-3xl font-black text-gray-900 outline-none placeholder:text-orange-200"
                                    placeholder="000,000"
                                />
                                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>{property?.propertyType === "flat" ? "Beds" : "Floors"}</label>
                                    <input
                                        type="number"
                                        {...register("unitCount", { required: "Required", min: 1 })}
                                        className={inputStyle("unitCount")}
                                        placeholder="Count"
                                    />
                                    {errors.unitCount && <p className="text-red-500 text-xs mt-1">{errors.unitCount.message}</p>}
                                </div>
                                <div>
                                    <label className={labelStyle}>Baths</label>
                                    <input
                                        type="number"
                                        {...register("bathrooms", { required: "Required", min: 1 })}
                                        className={inputStyle("bathrooms")}
                                        placeholder="Count"
                                    />
                                    {errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms.message}</p>}
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Area (Sq Ft)</label>
                                <input
                                    type="number"
                                    {...register("areaSqFt", { required: "Area is required", min: 1 })}
                                    className={inputStyle("areaSqFt")}
                                    placeholder="e.g. 1500"
                                />
                                {errors.areaSqFt && <p className="text-red-500 text-xs mt-1">{errors.areaSqFt.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                        <h3 className={sectionTitle}><ImageIcon className="text-orange-500" size={20} /> Property Media</h3>
                        
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="mb-6">
                                <label className={labelStyle}>Current Images</label>
                                <div className="flex gap-3 flex-wrap">
                                    {existingImages.map((url, idx) => (
                                        <div key={idx} className="relative">
                                            <img src={url} alt={`existing-${idx}`} className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload New Images */}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-orange-50 transition-colors group">
                            <Upload className="text-gray-300 group-hover:text-orange-400 transition-colors mb-2" size={32} />
                            <span className="text-xs font-bold text-gray-400 group-hover:text-orange-500 uppercase tracking-tighter">Click to add more images</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFilesChange} />
                        </label>

                        {/* New File Previews */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-6">
                                <label className={labelStyle}>New Images</label>
                                <div className="flex gap-3 flex-wrap">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="relative">
                                            <img src={URL.createObjectURL(file)} alt={`new-${idx}`} className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                        <h3 className={sectionTitle}><CheckCircle className="text-orange-500" size={20} /> Amenities</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {AMENITIES.map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        value={item}
                                        {...register("amenities")}
                                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500/20 transition-all"
                                    />
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Overview */}
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                        <h3 className={sectionTitle}><Info className="text-orange-500" size={20} /> Detailed Overview</h3>
                        <textarea
                            {...register("overview", { required: "Detailed description is required", minLength: { value: 20, message: "Please describe in at least 20 characters" } })}
                            className={`${inputStyle("overview")} min-h-[150px] py-4 resize-none`}
                            placeholder="Describe your property's best features..."
                        />
                        {errors.overview && <p className="text-red-500 text-xs mt-1">{errors.overview.message}</p>}
                    </div>

                    {/* Location Map */}
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                        <h3 className={sectionTitle}><MapPin className="text-orange-500" size={20} /> Location</h3>
                        <div className={`rounded-2xl overflow-hidden border ${!watchCoords && errors.submitCount > 0 ? 'border-red-300' : 'border-gray-200'} h-[400px] shadow-inner relative`}>
                            <MapPicker setValue={setValue} flyTo={mapView} />
                        </div>
                        {!watchCoords && <p className="text-red-500 text-xs mt-2">Please click on the map to set location</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                                isSubmitting
                                    ? 'bg-orange-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:brightness-110 active:scale-95'
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={18} />
                                    Updating...
                                </span>
                            ) : (
                                "Update Property"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPropertyModal;

