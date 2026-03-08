import React, { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/useTransactions';
import { X } from 'lucide-react';
import type { Transaction } from '../../types';

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || '',
    description: transaction?.description || '',
    date: transaction ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    categoryId: transaction?.categoryId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (transaction) {
      updateMutation.mutate({
        id: transaction.id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        categoryId: formData.categoryId,
      }, { onSuccess: onClose });
    } else {
      createMutation.mutate({
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        categoryId: formData.categoryId,
      }, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {transaction ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
            >
              <option value="">Select a category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
              placeholder="Coffee with friends..."
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (transaction ? 'Update' : 'Save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
