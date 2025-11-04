import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
// ❌ Removed: import Badge from '../common/Badge'; (not used)
import { ExternalLink, Crown } from 'lucide-react';

const TopCustomers = ({ customers }) => {
  return (
    <Card 
      title="Top Customers" 
      action={
        <Link to="/customers">
          <Button variant="outline" size="sm" icon={ExternalLink}>
            View All
          </Button>
        </Link>
      }
    >
      {!customers || customers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No customer data available</p>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div
              key={customer.customer_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <span className="text-blue-600 font-bold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-gray-900">{customer.name}</h4>
                    {customer.is_vip && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ₹{parseFloat(customer.lifetime_value).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500">
                  {customer.total_orders} orders
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TopCustomers;
