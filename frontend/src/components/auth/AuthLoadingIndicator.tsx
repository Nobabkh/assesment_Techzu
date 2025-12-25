import React from 'react';
import { useAppSelector } from '../../store';

const AuthLoadingIndicator: React.FC = () => {
    const { isLoading } = useAppSelector((state) => state.auth);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[9999]">
            <div className="flex flex-col items-center bg-white p-[30px] rounded-lg shadow-lg">
                <div className="w-8 h-8 border-3 border-black/10 rounded-full border-t-primary animate-spin mb-4"></div>
                <p className="m-0 text-gray-800 text-base font-medium">Processing authentication...</p>
            </div>
        </div>
    );
};

export default AuthLoadingIndicator;