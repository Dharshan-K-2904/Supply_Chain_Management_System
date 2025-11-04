import React from 'react';
import StatCard from '../common/StatCard';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  AlertTriangle 
} from 'lucide-react';

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.total_customers || 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Products',
      value: stats.total_products || 0,
      icon: Package,
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: stats.total_orders || 0,
      icon: ShoppingCart,
      color: 'purple',
    },
    {
      title: 'Total Revenue',
      value: `₹${parseFloat(stats.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'yellow',
    },
    {
      title: 'Avg Order Value',
      value: `₹${parseFloat(stats.avg_order_value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'indigo',
    },
    {
      title: 'Low Stock Items',
      value: stats.low_stock_items || 0,
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsOverview;