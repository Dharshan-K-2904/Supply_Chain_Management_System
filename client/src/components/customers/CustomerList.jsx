import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Edit, Trash2, Crown, Mail, Phone } from 'lucide-react';

const CustomerList = ({ customers, onEdit, onDelete, onViewOrders }) => {
  const columns = [
    {
      header: 'ID',
      accessor: 'customer_id',
    },
    {
      header: 'Customer Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {row.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{row.name}</span>
              {row.is_vip && <Crown className="h-4 w-4 text-yellow-500 ml-2" />}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-1" />
            {row.email}
          </div>
          {row.phone_number && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-1" />
              {row.phone_number}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Company',
      accessor: 'company_name',
    },
    {
      header: 'Total Orders',
      accessor: 'total_orders',
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.total_orders || 0}</span>
      ),
    },
    {
      header: 'Lifetime Value',
      accessor: 'lifetime_value',
      render: (row) => (
        <span className="font-semibold text-green-600">
          ₹{parseFloat(row.lifetime_value || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.is_vip ? 'warning' : 'default'}>
          {row.is_vip ? 'VIP Customer' : 'Regular'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            icon={Edit}
            onClick={() => onEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => onDelete(row)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={customers} emptyMessage="No customers found" />;
};

export default CustomerList;