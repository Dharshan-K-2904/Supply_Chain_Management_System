import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { ExternalLink } from 'lucide-react';

const RecentOrders = ({ orders }) => {
  const getStatusVariant = (status) => {
    const variants = {
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <Card 
      title="Recent Orders" 
      action={
        <Link to="/orders">
          <Button variant="outline" size="sm" icon={ExternalLink}>
            View All
          </Button>
        </Link>
      }
    >
      {!orders || orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent orders</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{order.order_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {order.customer_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={order.priority === 'High' ? 'danger' : order.priority === 'Medium' ? 'warning' : 'default'}>
                      {order.priority}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RecentOrders;