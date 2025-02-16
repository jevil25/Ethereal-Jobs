import { toast, ToastOptions }from 'react-hot-toast';

interface ToastTypes {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
}

export const constructServerUrlFromPath = (path: string): string => {
    const basePath=  import.meta.env.VITE_SERVER_URL;
    if (path.startsWith('/')) {
        if (basePath.endsWith('/')) {
            return `${basePath.slice(0, -1)}${path}`;
        }
        return `${basePath}${path}`;
    }
    if (basePath.endsWith('/')) {
        return `${basePath}${path}`;
    }
    return `${basePath}/${path}`;
}

export const toaster: ToastTypes = {
    success: (message, options = {}) => toast.success(message, {
        ...options
    }),
    error: (message, options = {}) => toast.error(message, {
        ...options
    }),
};
