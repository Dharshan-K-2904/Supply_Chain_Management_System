import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Edit, Package, Warehouse } from 'lucide-react';

const InventoryList = ({ inventory, onUpdate }) => {
  const getStockStatusVariant = (status) => {
    const variants = {
      'Critical': 'danger',
      'Low': 'warning',
      'Normal': 'success',
    };
    return variants[status] || 'default';
  };

  const columns = [
    {
      header: 'Product',
      render: (row) => (
        <div className="flex items-center">
          <Package className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <div className="font-medium text-gray-900">{row.product_name}</div>
            <div className="text-xs text-gray-500">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      render: (row) => (
        <div className="flex items-center">
          <Warehouse className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <div className="font-medium text-gray-900">{row.warehouse_name}</div>
            <div className="text-xs text-gray-500">{row.location}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      accessor: 'quantity',
      render: (row) => (
        <span className="text-lg font-semibold text-gray-900">{row.quantity}</span>
      ),
    },
    {
      header: 'Reorder Level',
      accessor: 'reorder_level',
      render: (row) => (
        <span className="text-sm text-gray-600">{row.reorder_level}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'stock_status',
      render: (row) => (
        <Badge variant={getStockStatusVariant(row.stock_status)}>
          {row.stock_status}
        </Badge>
      ),
    },
    {
      header: 'Unit Price',
      accessor: 'unit_price',
      render: (row) => (
        <span className="font-medium text-gray-900">
          ₹{parseFloat(row.unit_price).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Total Value',
      render: (row) => (
        <span className="font-semibold text-green-600">
          ₹{(parseFloat(row.unit_price) * parseInt(row.quantity)).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          icon={Edit}
          onClick={() => onUpdate(row)}
        >
          Update
        </Button>
      ),
    },
  ];

  return <Table columns={columns} data={inventory} emptyMessage="No inventory records found" />;
};

export default InventoryList;