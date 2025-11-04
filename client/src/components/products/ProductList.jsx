import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Edit, Trash2, Package } from 'lucide-react';

const ProductList = ({ products, onEdit, onDelete }) => {
  const columns = [
    {
      header: 'ID',
      accessor: 'product_id',
    },
    {
      header: 'Product Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center">
          <Package className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <Badge variant="primary">{row.category}</Badge>
      ),
    },
    {
      header: 'Supplier',
      accessor: 'supplier_name',
    },
    {
      header: 'Price',
      accessor: 'unit_price',
      render: (row) => (
        <span className="font-semibold">
          ₹{parseFloat(row.unit_price).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Stock',
      accessor: 'total_stock',
      render: (row) => {
        const stock = parseInt(row.total_stock);
        return (
          <Badge variant={stock > 50 ? 'success' : stock > 20 ? 'warning' : 'danger'}>
            {stock} units
          </Badge>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'availability',
      render: (row) => (
        <Badge variant={row.availability ? 'success' : 'danger'}>
          {row.availability ? 'Available' : 'Unavailable'}
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

  return <Table columns={columns} data={products} emptyMessage="No products found" />;
};

export default ProductList;