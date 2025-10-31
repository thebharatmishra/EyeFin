// src/components/Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import useSocket from '../hooks/useSocket';
import { Transaction } from '../types/transaction';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState<'all' | 'flagged'>('all');
    const [sortKey, setSortKey] = useState<'timestamp' | 'amount'>('timestamp');

    // initial fetch
    useEffect(() => {
        axios.get('/api/transactions').then(res => setTransactions(res.data));
    }, []);

    const handleNew = (tx: Transaction) => {
        setTransactions(prev => [tx, ...prev].slice(0, 200));
    };

    const handleFlagged = (tx: Transaction) => {
        setTransactions(prev => {
            const idx = prev.findIndex(t => t.id === tx.id);
            if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = tx;
                return copy;
            }
            return [tx, ...prev].slice(0, 200);
        });
    };

    useSocket(handleNew, handleFlagged);

    const filtered = transactions.filter(t => filter === 'all' ? true : t.isFlagged);
    const sorted = filtered.sort((a, b) => sortKey === 'timestamp' ? (Date.parse(b.timestamp) - Date.parse(a.timestamp)) : (b.amount - a.amount));

    // chart data: spending by category (sum amounts)
    const spendingByCategory = useMemo(() => {
        const map = new Map<string, number>();
        transactions.forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
        return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
    }, [transactions]);

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Real-time Transactions</h1>
                <div className="space-x-2">
                    <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Show All</button>
                    <button onClick={() => setFilter('flagged')} className={`px-3 py-1 rounded ${filter === 'flagged' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>Show Flagged</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white shadow rounded p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-semibold">Transactions</h2>
                            <div className="text-sm">
                                <label>Sort:</label>
                                <select className="ml-2 p-1 border rounded" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
                                    <option value="timestamp">Newest</option>
                                    <option value="amount">Amount</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[60vh]">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="py-2">Time</th>
                                        <th>Merchant</th>
                                        <th>Category</th>
                                        <th className="text-right">Amount</th>
                                        <th>Flags</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map(tx => (
                                        <tr key={tx.id} className={`border-b ${tx.isFlagged ? 'bg-red-50' : ''}`}>
                                            <td className="py-2 text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                                            <td>{tx.merchant} <span className="text-xs text-gray-400">({tx.country})</span></td>
                                            <td>{tx.category}</td>
                                            <td className="text-right font-medium">{tx.currency} {tx.amount.toFixed(2)}</td>
                                            <td>{tx.isFlagged ? (<span className="text-red-700 font-semibold">{tx.flags?.join(', ')}</span>) : (<span className="text-gray-400">—</span>)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="bg-white shadow rounded p-4 h-full">
                        <h3 className="font-semibold mb-2">Spending by Category</h3>
                        <div style={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <BarChart data={spendingByCategory}>
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded p-4">
                        <h3 className="font-semibold mb-2">Flagged Summary</h3>
                        <div>
                            <p className="text-sm">Total transactions: {transactions.length}</p>
                            <p className="text-sm text-red-600">Flagged: {transactions.filter(t => t.isFlagged).length}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
