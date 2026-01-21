import { useContext } from 'react';
import { ComparisonContext } from '../context/ComparisonContext';

const useComparison = () => {
    const context = useContext(ComparisonContext);

    if (!context) {
        throw new Error('useComparison must be used within ComparisonProvider');
    }

    return context;
};

export default useComparison;
