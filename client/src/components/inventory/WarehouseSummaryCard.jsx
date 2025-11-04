import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Warehouse, Package, AlertTriangle, TrendingUp } from 'lucide-react';

const WarehouseSummaryCard = ({ warehouse }) => {
  const getUtilizationVariant = (utilization) => {
    if (utilization > 80) return 'danger';
    if (utilization > 60) return 'warning';
    if (utilization > 30) return 'success';
    return 'default';
  };

  const getUtilizationStatus = (utilization) => {
    if (utilization > 80) return 'Over Capacity';
    if (utilization > 60) return 'Optimal';
    if (utilization > 30) return 'Under Utilized';
    return 'Empty';
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Warehouse className="h-8 w-8 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{warehouse.warehouse_name}</h3>
            <p className="text-sm text-gray-500">{warehouse.location}</p>
          </div>
        </div>
        <Badge variant={getUtilizationVariant(parseFloat(warehouse.utilization_percent))}>
          {getUtilizationStatus(parseFloat(warehouse.utilization_percent))}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div>
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <Package className="h-4 w-4 mr-1" />
            Capacity
          </div>
          <p className="text-xl font-bold text-gray-900">
            {parseInt(warehouse.capacity).toLocaleString()}
          </p>
        </div>

        <div>
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            Current Stock
          </div>
          <p className="text-xl font-bold text-primary-600">
            {parseInt(warehouse.total_items || 0).toLocaleString()}
          </p>
        </div>

        <div>
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <Package className="h-4 w-4 mr-1" />
            Products
          </div>
          <p className="text-xl font-bold text-gray-900">
            {warehouse.product_count || 0}
          </p>
        </div>

        <div>
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Low Stock
          </div>
          <p className="text-xl font-bold text-red-600">
            {warehouse.low_stock_items || 0}
          </p>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Utilization</span>
          <span className="font-semibold">{parseFloat(warehouse.utilization_percent).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              parseFloat(warehouse.utilization_percent) > 80
                ? 'bg-red-500'
                : parseFloat(warehouse.utilization_percent) > 60
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(parseFloat(warehouse.utilization_percent), 100)}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

export default WarehouseSummaryCard;
