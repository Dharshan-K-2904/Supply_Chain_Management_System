import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import { Plus, Package, AlertTriangle } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);

  // ✅ useCallback to prevent eslint dependency warnings
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = showLowStock 
        ? await productService.getLowStockProducts()
        : await productService.getAllProducts();
      
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [showLowStock]);

  const fetchSuppliers = useCallback(async () => {
    try {
      // Mock suppliers - in real app, fetch from API
      setSuppliers([
        { supplier_id: 1, name: 'ABC Electronics' },
        { supplier_id: 2, name: 'XYZ Components' },
        { supplier_id: 3, name: 'Mega Supplies' },
      ]);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }, []);

  // ✅ useEffect now safely depends on memoized functions
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [fetchProducts, fetchSuppliers]);

  const handleCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await productService.deleteProduct(product.product_id);
        alert('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.product_id, formData);
        alert('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        alert('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-primary-600" />
            Products
          </h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={showLowStock ? 'primary' : 'outline'}
            icon={AlertTriangle}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            {showLowStock ? 'Show All' : 'Low Stock'}
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Available</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {products.filter(p => p.availability).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Low Stock</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {products.filter(p => parseInt(p.total_stock) <= 20).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Categories</p>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {[...new Set(products.map(p => p.category))].length}
            </p>
          </div>
        </Card>
      </div>

      {/* Product List */}
      <Card>
        {loading ? (
          <Loader />
        ) : (
          <ProductList
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          suppliers={suppliers}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Products;
