import { useState } from 'react';
import { userSignin, userSignup } from '../../api/user';
import { useNavigate } from 'react-router-dom'; // Import for redirection

interface AuthFormsProps {
    isSignIn: boolean;
    setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: () => void;
}

const AuthForms: React.FC<AuthFormsProps> = ({ isSignIn, setIsSignIn, onClose }) => {
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear error when user starts typing again
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSignIn) {
        const response = await userSignin({
          email: formData.email,
          password: formData.password
        });  
        if (response.is_valid) {
          setSuccessMessage('Sign in successful! Redirecting...');
          // Redirect to homepage after successful login
          setTimeout(() => {
            onClose();
            navigate('/');
          }, 1500);
        } else {
          if (!response.is_exists) {
            setError('User does not exist. Please check your email or sign up.');
          } else {
            setError('Invalid credentials. Please check your email and password.');
          }
        }
      } else {
        const response = await userSignup({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        
        console.log(response);
        
        if (response.is_created) {
          setSuccessMessage('Account created successfully! You can now sign in.');
          // Switch to sign in form after successful signup
          setTimeout(() => {
            setIsSignIn(true);
            setSuccessMessage(null);
          }, 2000);
        } else if (response.is_exists) {
          setError('User with this email already exists. Please sign in instead.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20">
      <div 
        className="absolute inset-0 bg-black opacity-50" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-lg p-8 w-full max-w-md z-30 relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignIn ? 'Sign In to Jobify' : 'Create an Account'}
        </h2>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isSignIn && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your full name"
                required={!isSignIn}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <span>{isSignIn ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleForm}
              className="ml-2 text-black font-medium hover:underline focus:outline-none"
              disabled={isLoading}
            >
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
        
        <button
          className="mt-6 text-gray-500 hover:text-gray-700 text-sm text-center w-full"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AuthForms;