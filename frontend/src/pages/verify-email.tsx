import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/user';
import Navbar from '../components/HomePage/Navbar';
import ResendVerification from '../components/Auth/ResendVerification';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [_, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [resendEmail, setResendEmail] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyUserEmail = async () => {
        const emailToken = searchParams.get('token');
        setToken(emailToken);
        if (!emailToken) {
            setError('Invalid or missing verification link.');
            setIsLoading(false);
            return;
        }
        
        try {
            const response = await verifyEmail({ token: emailToken });
            if (response.message == "Email already verified") {
                setSuccessMessage('Email already verified! Redirecting to sign in...');
                setTimeout(() => navigate('/?login=true'), 2000);
            }
            if (response.is_valid && !response.is_expired) {
                setSuccessMessage('Email verified successfully! Redirecting to sign in...');
                setTimeout(() => navigate('/?login=true'), 2000);
            }
            else if (response.is_expired) {
                setError('Verification link has expired. Please request a new one.');
                setResendEmail(response.email || null);
                setTokenExpired(true);
            }
            else {
                setError('Failed to verify email. Please try again.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
        };

        verifyUserEmail();
    }, [searchParams, navigate]);

    return (
        <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-6">
                {isLoading ? 'Verifying Email...' : error ? 'Verification Failed' : 'Email Verified!'}
            </h2>
            
            {isLoading && <p className="text-gray-700">Please wait while we verify your email.</p>}
            {error && <p className="text-red-600">{error}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}

            {
                (tokenExpired && resendEmail) && (
                    <div className="mt-4 w-full">
                        <ResendVerification resendEmail={resendEmail} showMessage={false}/>
                    </div>
                )
            }
            
            {!isLoading && error && !tokenExpired && (
                <button
                onClick={() => navigate('/signin')}
                className="w-full py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors mt-4"
                >
                Go to Sign In
                </button>
            )}
            </div>
        </div>
        </>
    );
};

export default VerifyEmailPage;
