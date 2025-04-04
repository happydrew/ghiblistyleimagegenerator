import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPaymentRecords } from '@/lib/credits';
import { Card, Spinner, Button, Table } from '@nextui-org/react';
import { FaCoins, FaHistory, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function CreditsHistory() {
    const { user, credits, refreshCredits } = useAuth();
    const [paymentRecords, setPaymentRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const limit = 10;

    useEffect(() => {
        if (user) {
            refreshCredits();
            fetchPaymentRecords();
        } else {
            setIsLoading(false);
        }
    }, [user, page]);

    const fetchPaymentRecords = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const records = await getUserPaymentRecords(user.id, limit, page * limit);
            setPaymentRecords(records);
            setHasMore(records.length === limit);
        } catch (error) {
            console.error('Error fetching payment records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-500';
            case 'pending': return 'text-amber-500';
            case 'failed': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'pending': return 'Processing';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f5f9ee] py-16 flex justify-center items-center">
                <Card className="max-w-md w-full p-8 bg-white shadow-lg rounded-2xl">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-[#1c4c3b] mb-4">Login Required</h2>
                        <p className="text-[#506a3a] mb-6">
                            Please login to view your credits history.
                        </p>
                        <Button
                            className="bg-gradient-to-r from-[#1c4c3b] to-[#2a6854] text-white px-8 py-6 w-full rounded-xl"
                            onClick={() => window.location.href = '/'}
                        >
                            Return to Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f9ee] py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#1c4c3b] mb-4">My Credits</h1>
                    <p className="text-xl text-[#506a3a]">
                        View your credit balance and transaction history
                    </p>
                </div>

                {/* Current Credits */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-[#89aa7b]/30 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-[#1c4c3b]">Current Credit Balance</h2>
                            <p className="text-[#506a3a] text-sm">For generating Ghibli style images</p>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 p-4 rounded-xl">
                            <FaCoins className="text-amber-500 w-6 h-6" />
                            <span className="text-2xl font-bold text-[#1c4c3b]">{credits}</span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg"
                            onClick={() => window.location.href = '/pricing'}
                        >
                            Purchase More Credits
                        </Button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-[#89aa7b]/30">
                    <div className="flex items-center gap-2 mb-4">
                        <FaHistory className="text-[#1c4c3b]" />
                        <h2 className="text-xl font-bold text-[#1c4c3b]">Transaction History</h2>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <Spinner size="lg" color="success" />
                            <p className="mt-4 text-[#506a3a]">Loading transactions...</p>
                        </div>
                    ) : paymentRecords.length === 0 ? (
                        <div className="text-center py-8 border rounded-xl border-dashed border-gray-300">
                            <p className="text-[#506a3a]">No transaction records</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-[#1c4c3b]">Date</th>
                                            <th className="px-4 py-3 text-left text-[#1c4c3b]">Plan</th>
                                            <th className="px-4 py-3 text-left text-[#1c4c3b]">Amount</th>
                                            <th className="px-4 py-3 text-left text-[#1c4c3b]">Credits</th>
                                            <th className="px-4 py-3 text-left text-[#1c4c3b]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentRecords.map((record) => (
                                            <tr key={record.id} className="border-b border-gray-100">
                                                <td className="px-4 py-4 text-[#506a3a]">{formatDate(record.created_at)}</td>
                                                <td className="px-4 py-4 text-[#506a3a] capitalize">{record.plan_id}</td>
                                                <td className="px-4 py-4 text-[#506a3a]">${record.amount}</td>
                                                <td className="px-4 py-4 text-[#506a3a]">{record.credits}</td>
                                                <td className={`px-4 py-4 ${getStatusColor(record.status)}`}>
                                                    {getStatusText(record.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6">
                                <Button
                                    className="bg-[#f5f9ee] text-[#1c4c3b] border border-[#89aa7b]/30 px-4 py-2 rounded-lg"
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                >
                                    <FaArrowLeft className="mr-2" /> Previous
                                </Button>
                                <span className="text-[#506a3a]">Page {page + 1}</span>
                                <Button
                                    className="bg-[#f5f9ee] text-[#1c4c3b] border border-[#89aa7b]/30 px-4 py-2 rounded-lg"
                                    onClick={() => setPage(page + 1)}
                                    disabled={!hasMore}
                                >
                                    Next <FaArrowRight className="ml-2" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom Button */}
                <div className="mt-8 text-center">
                    <Button
                        className="bg-gradient-to-r from-[#1c4c3b] to-[#2a6854] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        onClick={() => window.location.href = '/'}
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        </div>
    );
} 