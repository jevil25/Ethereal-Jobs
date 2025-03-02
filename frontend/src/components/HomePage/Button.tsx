import React from 'react';

interface ButtonProps {
    text: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text , onClick }) => {
    return (
        <button className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:cursor-pointer"
            onClick={() => onClick && onClick()}
        >
            {text}
        </button>
    );
};

export default Button;