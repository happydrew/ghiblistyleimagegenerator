import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Spinner } from '@nextui-org/react';
import { FaCheckCircle, FaCoins, FaExclamationTriangle } from 'react-icons/fa';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const { order_id } = router.query;
    const { user, refreshCredits } = useAuth();
    const [paymentStatus, setPaymentStatus] = useState<string>('processing');
    const [purchasedCredits, setPurchasedCredits] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [retryCount, setRetryCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!order_id || !user) {
            if (!user) {
                // If user is not logged in, redirect to homepage
                router.push('/');
                return;
            }

            if (!order_id && user) {
                setIsLoading(false);
                setError('Invalid order ID, please contact customer service');
                return;
            }

            return;
        }

        const checkPaymentStatus = async () => {
            try {
                const response = await fetch(`/api/payment/status?order_id=${order_id}`);
                if (!response.ok) {
                    throw new Error('Failed to get payment status');
                }

                const { payment } = await response.json();

                if (payment.status === 'completed') {
                    setPaymentStatus('completed');
                    setPurchasedCredits(payment.credits);
                    // Refresh user credits
                    await refreshCredits();
                    setIsLoading(false);
                } else if (payment.status === 'failed') {
                    setPaymentStatus('failed');
                    setIsLoading(false);
                } else {
                    // If still processing and retry count is less than 20 (about 60 seconds), continue polling
                    if (retryCount < 20) {
                        setRetryCount(prev => prev + 1);
                        setTimeout(checkPaymentStatus, 3000);
                    } else {
                        // Timeout handling
                        setPaymentStatus('timeout');
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                setPaymentStatus('error');
                setError(error.message || 'An error occurred while getting payment status');
                setIsLoading(false);
            }
        };

        checkPaymentStatus();
    }, [order_id, user, retryCount]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-8">
                    <Spinner size="lg" color="success" />
                    <p className="mt-4 text-lg text-[#506a3a]">Processing your payment...</p>
                    <p className="text-sm text-[#506a3a] mt-2">Please wait, this may take a few seconds</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center">
                    <FaExclamationTriangle className="text-amber-500 w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-amber-600 mb-2">Problem Occurred</h2>
                    <p className="text-[#506a3a] mb-6">{error}</p>
                    <Button
                        className="bg-gradient-to-r from-[#1c4c3b] to-[#2a6854] text-white px-8 py-6 w-full rounded-xl"
                        onClick={() => router.push('/')}
                    >
                        Return to Home
                    </Button>
                </div>
            );
        }

        switch (paymentStatus) {
            case 'completed':
                return (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-[#1c4c3b] mb-2">Payment Successful!</h2>
                        <p className="text-[#506a3a] mb-6">
                            Your purchase has been completed successfully. The following credits have been added to your account:
                        </p>
                        <div className="bg-amber-50 p-4 rounded-xl flex items-center justify-center gap-2 mb-8">
                            <FaCoins className="text-amber-500 w-6 h-6" />
                            <span className="text-xl font-bold text-[#1c4c3b]">{purchasedCredits} Credits</span>
                        </div>
                        <Button
                            className="bg-gradient-to-r from-[#1c4c3b] to-[#2a6854] text-white px-8 py-6 w-full rounded-xl"
                            onClick={() => router.push('/')}
                        >
                            Return to Home
                        </Button>
                    </div>
                );
            case 'failed':
                return (
                    <div className="text-center">
                        <FaExclamationTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
                        <p className="text-[#506a3a] mb-6">
                            Sorry, your payment could not be processed successfully. Please try again.
                        </p>
                        <Button
                            className="bg-gradient-to-r from-[#1c4c3b] to-[#2a6854] text-white px-8 py-6 w-full rounded-xl"
                            onClick={() => router.push('/pricing')}
                        >
                            Try Again
                        </Button>
                    </div>
                );
            case 'timeout':
                return (
                    <div className="text-center">
                        <FaExclamationTriangle className="text-amber-500 w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-amber-600 mb-2">Payment Processing Timeout</h2>
                        <p className="text-[#506a3a] mb-6">
                            Your payment is being processed, but it's taking longer than expected. You can return to the homepage, and the system will automatically add credits to your account once processing is complete.
                        </p>
                        <Button
                            className="bg-gradient-to-r from-[#1c4c3b] to-[#2a6854] text-white px-8 py-6 w-full rounded-xl"
                            onClick={() => router.push('/')}
                        >
                            Return to Home
                        </Button>
                    </div>
                );
            default:
                return (
                    <div className="text-center">
                        <FaExclamationTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Occurred</h2>
                        <p className="text-[#506a3a] mb-6">
                            An error occurred while processing your payment. Please contact customer service for assistance.
                        </p>
                        <Button
                            className="bg-gradient-to-r from-[#1c4c3b] to-[#2a6854] text-white px-8 py-6 w-full rounded-xl"
                            onClick={() => router.push('/')}
                        >
                            Return to Home
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f9ee] py-16 flex justify-center items-center">
            <Card className="max-w-md w-full p-8 bg-white shadow-lg rounded-2xl">
                {renderContent()}
            </Card>
        </div>
    );
}
