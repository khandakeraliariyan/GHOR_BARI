import { createContext, useState, useCallback } from 'react';

export const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
    const [selectedProperties, setSelectedProperties] = useState([]);

    const addProperty = useCallback((property) => {
        // Prevent duplicates
        if (!selectedProperties.find(p => p._id === property._id)) {
            // Maximum 5 properties for comparison
            if (selectedProperties.length < 5) {
                setSelectedProperties(prev => [...prev, property]);
            }
        }
    }, [selectedProperties]);

    const removeProperty = useCallback((propertyId) => {
        setSelectedProperties(prev => prev.filter(p => p._id !== propertyId));
    }, []);

    const isPropertySelected = useCallback((propertyId) => {
        return selectedProperties.some(p => p._id === propertyId);
    }, [selectedProperties]);

    const clearAllProperties = useCallback(() => {
        setSelectedProperties([]);
    }, []);

    const value = {
        selectedProperties,
        addProperty,
        removeProperty,
        isPropertySelected,
        clearAllProperties,
        selectedCount: selectedProperties.length
    };

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    );
};
