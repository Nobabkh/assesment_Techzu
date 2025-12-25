import React from 'react';
import { useTypingUsers } from '../hooks';
import { useAppSelector } from '../store';

interface TypingIndicatorProps {
    commentId?: string;
    className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ commentId, className = '' }) => {
    const typingUsers = useTypingUsers(commentId);
    const { user } = useAppSelector((state: any) => state.auth);

    // Filter out the current user
    const otherTypingUsers = typingUsers.filter((userId: string) => userId !== user?.id);

    if (otherTypingUsers.length === 0) {
        return null;
    }

    const getTypingText = () => {
        const count = otherTypingUsers.length;

        if (count === 1) {
            return 'Someone is typing...';
        } else if (count === 2) {
            return 'Two people are typing...';
        } else {
            return `${count} people are typing...`;
        }
    };

    return (
        <div className={`flex items-center gap-2 p-2 bg-black/5 rounded-2xl text-sm text-gray-500 animate-[fadeIn_0.3s_ease-in-out] ${className} dark:bg-white/10 dark:text-gray-300`}>
            <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-[typing_1.4s_infinite] dark:bg-gray-300"></span>
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-[typing_1.4s_infinite] animation-delay-200 dark:bg-gray-300"></span>
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-[typing_1.4s_infinite] animation-delay-400 dark:bg-gray-300"></span>
            </div>
            <span className="italic font-medium">{getTypingText()}</span>
        </div>
    );
};

export default TypingIndicator;