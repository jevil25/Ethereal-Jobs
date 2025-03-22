import toast from "react-hot-toast";

interface ToastOptions {
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  style?: React.CSSProperties;
}

const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info",
  options: ToastOptions = {},
) => {
  const defaultOptions: ToastOptions = {
    duration: 3000,
    position: "top-right",
    style: {
      background:
        type === "success"
          ? "#4caf50"
          : type === "error"
            ? "#f44336"
            : "#2196f3",
      color: "#fff",
      padding: "10px",
      borderRadius: "5px",
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  switch (type) {
    case "success":
      toast.success(message, mergedOptions);
      break;
    case "error":
      toast.error(message, mergedOptions);
      break;
    case "info":
    default:
      toast(message, mergedOptions);
      break;
  }
};

export default showToast;
