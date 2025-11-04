import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { ExternalLink, TrendingUp } from 'lucide-react';

const TopProducts = ({ products }) => {
  return (
    <Card 
      title="Top Selling Products" 
      action={
        <Link to="/products">
          <Button variant="outline" size="sm" icon={ExternalLink}>
            View All
          </Button>
        </Link>
      }
    >
      {!products || products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No product data available</p>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.product_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                  <span className="text-primary-600 font-bold text-lg">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {product.units_sold} units
                </div>
                <p className="text-xs text-gray-500">
                  ₹{parseFloat(product.total_revenue).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TopProducts;