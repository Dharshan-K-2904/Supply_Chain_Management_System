import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Eye } from 'lucide-react';

const OrderList = ({ orders, onViewDetails }) => {
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

  const getPriorityVariant = (priority) => {
    const variants = {
      'High': 'danger',
      'Medium': 'warning',
      'Low': 'default',
    };
    return variants[priority] || 'default';
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: 'order_id',
      render: (row) => (
        <span className="font-semibold text-primary-600">#{row.order_id}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customer_name}</div>
          <div className="text-xs text-gray-500">{row.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      render: (row) => (
        <span className="font-semibold text-gray-900">
          ₹{parseFloat(row.total_amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <Badge variant={getPriorityVariant(row.priority)}>
          {row.priority}
        </Badge>
      ),
    },
    {
      header: 'Tracking',
      accessor: 'tracking_number',
      render: (row) => (
        <span className="text-xs font-mono text-gray-600">
          {row.tracking_number || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => onViewDetails(row)}
        >
          View
        </Button>
      ),
    },
  ];

  return <Table columns={columns} data={orders} emptyMessage="No orders found" />;
};

export default OrderList;
