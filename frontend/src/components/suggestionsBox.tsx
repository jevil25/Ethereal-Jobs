interface SuggestionsBoxProps {
    suggestions: string[];
    setSuggestion: (suggestion: string) => void;
}

export const SuggestionsBox: React.FC<SuggestionsBoxProps> = ({ suggestions, setSuggestion }) => {
    return (
        <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1">
            <ul>
                {suggestions.map((title) => (
                    <li key={title} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => setSuggestion(title)}>
                        {title}
                    </li>
                ))}
            </ul>
        </div>
    );
};
