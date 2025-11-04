import React from 'react';
import Badge from '../common/Badge';
import Card from '../common/Card';
import { Package, User, CreditCard, Truck, Calendar, MapPin } from 'lucide-react';

const OrderDetails = ({ order }) => {
  if (!order) return null;

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
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Order #{order.order_id}</h2>
            <p className="text-primary-100 mt-1">
              Placed on {new Date(order.date).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Badge variant={getStatusVariant(order.status)} className="text-lg px-4 py-2">
            {order.status}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-primary-200 text-sm">Total Amount</p>
            <p className="text-2xl font-bold">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-primary-200 text-sm">Priority</p>
            <p className="text-xl font-semibold">{order.priority}</p>
          </div>
          <div>
            <p className="text-primary-200 text-sm">Days Since Order</p>
            <p className="text-xl font-semibold">{order.days_since_order || 0} days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card title="Customer Information">
          <div className="space-y-3">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Package className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{order.customer_address}</p>
              </div>
            </div>
            {order.customer_phone && (
              <div className="flex items-start">
                <Package className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Information */}
        <Card title="Payment Information">
          {order.payment ? (
            <div className="space-y-3">
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">{order.payment.method}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Package className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <Badge variant={order.payment.status === 'Completed' ? 'success' : 'warning'}>
                    {order.payment.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium text-gray-900">
                    {order.payment.payment_date 
                      ? new Date(order.payment.payment_date).toLocaleDateString('en-IN')
                      : 'Pending'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Package className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{parseFloat(order.payment.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No payment information available</p>
          )}
        </Card>
      </div>

      {/* Shipment Information */}
      {order.shipment && (
        <Card title="Shipment Information">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Carrier</p>
                <p className="font-medium text-gray-900">{order.shipment.carrier}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="font-mono text-sm font-medium text-primary-600">{order.shipment.tracking_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={order.shipment.status === 'Delivered' ? 'success' : 'primary'}>
                {order.shipment.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Arrival</p>
              <p className="font-medium text-gray-900">
                {new Date(order.shipment.estimated_arrival).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Order Items */}
      <Card title="Order Items">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.order_lines && order.order_lines.map((item) => (
                <tr key={item.orderline_id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ₹{parseFloat(item.price).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    ₹{parseFloat(item.line_total).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Grand Total:
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-primary-600">
                  ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Status Description */}
      {order.status_description && (
        <Card>
          <div className="flex items-start">
            <Package className="h-6 w-6 text-primary-500 mr-3" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Order Status</h4>
              <p className="text-gray-600">{order.status_description}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrderDetails;