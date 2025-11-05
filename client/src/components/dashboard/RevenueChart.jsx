import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card title="Daily Revenue (Last 30 Days)">
        <p className="text-gray-500 text-center py-8">No revenue data available</p>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.order_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(item.daily_revenue),
    orders: parseInt(item.order_count),
  })).reverse();

  return (
    <Card title="Daily Revenue (Last 30 Days)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'revenue') return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
              return [value, 'Orders'];
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
          <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;