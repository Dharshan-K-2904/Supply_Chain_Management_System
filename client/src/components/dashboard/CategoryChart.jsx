import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card title="Revenue by Category">
        <p className="text-gray-500 text-center py-8">No category data available</p>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    category: item.category,
    revenue: parseFloat(item.total_revenue),
    orders: parseInt(item.order_count),
    units: parseInt(item.units_sold),
  }));

  return (
    <Card title="Revenue by Category">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'revenue') return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
              if (name === 'orders') return [value, 'Orders'];
              return [value, 'Units'];
            }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
          <Bar dataKey="units" fill="#10b981" name="Units Sold" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default CategoryChart;