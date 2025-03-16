interface ViewToggleProps {
  viewMode: "split" | "optimized" | "original";
  setViewMode: (mode: "split" | "optimized" | "original") => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div className="flex gap-2 p-4">
      {["split", "optimized", "original"].map((mode) => (
        <button
          key={mode}
          onClick={() =>
            setViewMode(mode as "split" | "optimized" | "original")
          }
          className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
            viewMode === mode
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}{" "}
          {mode === "split" ? "View" : "Resume"}
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;
