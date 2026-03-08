import React from 'react';
import { useSummary, useChartData } from '../../hooks/useTransactions';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const { data: summary, isLoading: isLoadingSummary } = useSummary();
  const { data: chartData, isLoading: isLoadingChart } = useChartData();

  const cards = [
    {
      label: 'Net Balance',
      value: summary?.balance || 0,
      icon: <Wallet className="text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      label: 'Total Income',
      value: summary?.totalIncome || 0,
      icon: <TrendingUp className="text-green-500" />,
      color: 'bg-green-50',
    },
    {
      label: 'Total Expense',
      value: summary?.totalExpense || 0,
      icon: <TrendingDown className="text-red-500" />,
      color: 'bg-red-50',
    },
  ];

  if (isLoadingSummary || isLoadingChart) {
    return <div className="animate-pulse flex items-center justify-center h-64 text-gray-400 font-medium">Loading summary...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">${card.value.toLocaleString()}</h3>
            </div>
            <div className={`p-4 rounded-lg ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">Spending by Category</h2>
          <div className="h-[350px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data for chart
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">Top Categories</h2>
          <div className="space-y-4">
             {chartData?.slice(0, 5).map((item, index) => (
               <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">${item.value.toLocaleString()}</span>
               </div>
             ))}
             {(!chartData || chartData.length === 0) && (
               <div className="text-center py-10 text-gray-400">No category data yet.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
