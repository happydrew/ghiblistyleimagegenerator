import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@nextui-org/react';
import { FaArrowLeft, FaPaypal, FaCopy, FaCheck } from 'react-icons/fa';

export default function TempPurchase() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [userName, setUserName] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const PAYPAL_LINK = "https://www.paypal.com/paypalme/autoformai?country.x=C2&locale.x=en_US";

    useEffect(() => {
        // Only redirect if we're not loading and there's no user
        if (!isLoading && !user) {
            router.push('/');
            return;
        }

        if (user) {
            setUserName(user.email || '');
        }
    }, [isLoading, user, router]);

    // Show loading state while auth is initializing
    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleGoHome = () => {
        router.push('/');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(userName);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#f5f9ee] py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Page title & navigation */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleGoHome}
                        className="flex items-center text-[#1c4c3b] hover:text-[#2a6854] transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Home
                    </button>
                </div>

                <Card className="p-8 bg-white shadow-lg rounded-2xl mb-8">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-[#1c4c3b]">Secure Credit Purchase</h1>
                        <p className="text-[#506a3a] mt-2">Fast and secure way to add credits to your account</p>
                    </div>

                    <div className="space-y-6 text-[#506a3a]">
                        <div className="bg-gradient-to-r from-[#f0f9ee] to-[#e8f5e4] p-6 rounded-xl border border-[#d0e7c8]">
                            <h2 className="text-xl font-bold text-[#1c4c3b] mb-3">Hello, {userName.split('@')[0]}!</h2>
                            <p>
                                Thank you for choosing Ghibli Style Image Generator. As the creator of this service, I'm committed to providing you with the best AI-generated Ghibli-style imagery.
                            </p>
                            <p className="mt-2">
                                We're currently in the process of integrating our payment system. In the meantime, you can purchase credits directly through PayPal using the secure link below.
                            </p>
                        </div>

                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                            <h3 className="text-lg font-bold text-[#1c4c3b] mb-3">Transparent Pricing</h3>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><span className="font-medium">$0.10 per credit</span> - Each credit generates one beautiful Ghibli-style image</li>
                                <li><span className="font-medium">Minimum purchase: $1.00</span> - Get 10 credits to start your creative journey</li>
                                <li><span className="font-medium">No subscription fees</span> - Pay only for what you need</li>
                                <li><span className="font-medium">Credits never expire</span> - Use them anytime</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="text-lg font-bold text-blue-700 mb-3">Important Payment Instructions</h3>
                            <p className="mb-3">To ensure your account is properly credited, please follow these steps:</p>

                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Click the PayPal button below to go to our secure payment page</li>
                                <li>Enter your desired payment amount ($1.00 minimum)</li>
                                <li>
                                    <strong>Critical:</strong> In the payment note, copy and paste your account email:
                                    <div className="mt-2 p-3 bg-white rounded border border-gray-200 flex justify-between items-center">
                                        <code className="text-sm text-blue-800">{userName}</code>
                                        <button
                                            onClick={copyToClipboard}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            aria-label="Copy email to clipboard"
                                        >
                                            {copied ? <FaCheck /> : <FaCopy />}
                                        </button>
                                    </div>
                                </li>
                                <li>Complete your payment</li>
                            </ol>

                            <p className="mt-3 font-medium">
                                We will credit your account within 24 hours of receiving your payment, typically much faster during business hours.
                            </p>
                        </div>

                        <div className="text-center">
                            <a
                                href={PAYPAL_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-4 px-8 rounded-xl transition-colors w-full md:w-auto"
                            >
                                <FaPaypal className="text-xl" /> Pay with PayPal
                            </a>
                            <p className="text-sm text-gray-500 mt-2">You will be redirected to PayPal's secure payment page</p>
                        </div>
                    </div>
                </Card>

                {/* Trust elements */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-[#d0e7c8]">
                    <h3 className="text-lg font-bold text-[#1c4c3b] mb-4 text-center">Customer Satisfaction Guarantee</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3">
                            <h4 className="font-medium text-[#1c4c3b]">Secure Payments</h4>
                            <p className="text-sm text-[#506a3a]">All transactions processed through PayPal's secure platform</p>
                        </div>
                        <div className="text-center p-3">
                            <h4 className="font-medium text-[#1c4c3b]">Quick Support</h4>
                            <p className="text-sm text-[#506a3a]">Fast response to any questions or concerns</p>
                        </div>
                        <div className="text-center p-3">
                            <h4 className="font-medium text-[#1c4c3b]">Satisfaction Guaranteed</h4>
                            <p className="text-sm text-[#506a3a]">We're committed to your creative success</p>
                        </div>
                    </div>
                </div>

                {/* Contact info */}
                <div className="mt-8 text-center">
                    <p className="text-[#506a3a]">
                        Questions? Contact us at: <a href="mailto:support@ghiblistyle.ai" className="text-[#1c4c3b] font-medium hover:underline">support@ghiblistyle.ai</a>
                    </p>
                </div>
            </div>
        </div>
    );
} 