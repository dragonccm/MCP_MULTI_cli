import React, { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';
import TransactionForm from './TransactionForm';
import type { Transaction } from '../../types';

const TransactionList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const { data: transactions, isLoading } = useTransactions(filters);
  const deleteMutation = useDeleteTransaction();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filters (simplified) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 items-center">
        <Filter size={20} className="text-gray-400" />
        <select
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
          className="bg-gray-50 border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {format(new Date(0, i), 'MMMM')}
            </option>
          ))}
        </select>
        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
          className="bg-gray-50 border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading transactions...</td></tr>
            ) : transactions?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No transactions found for this period.</td></tr>
            ) : (
              transactions?.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.description || 'No description'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.category?.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.category?.name}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.category?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.category?.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <TransactionForm
          transaction={editingTransaction || undefined}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default TransactionList;
