import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import ProductHeader from './components/ProductHeader';
import ProductFilters from './components/ProductFilters';
import ProductTable from './components/ProductTable';
import LedgerBanner from './components/LedgerBanner';
import DeleteProductModal from './components/DeleteProductModal';
import ProductDetailsModal from './components/ProductDetailsModal';
import productApi from '../../../services/productApi';
import { useNavigate } from 'react-router-dom';

const ProductDirectory = () => {
  const navigate = useNavigate();
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'ALL',
    status: 'ALL'
  });
  const queryClient = useQueryClient();

  // ── Data Fetching ──────────────────────────────────
  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
  });

  const products = productsData?.data || [];

  // ── ESC Key Listener ──────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setProductToDelete(null);
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // ── Mutations ──────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setProductToDelete(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete product');
      setProductToDelete(null);
    }
  });

  const handleDeleteTrigger = (product) => {
    setProductToDelete(product);
  };

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fcfcfd]">
      <ProductHeader products={products} isLoading={isLoading} />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={() => deleteMutation.mutate(productToDelete._id)}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={(product) => navigate(`/dashboard/products/edit/${product._id}`)}
        />
      )}

      <div className="bg-[#fcfcfd] rounded-2xl">
        <ProductFilters filters={filters} setFilters={setFilters} />
        <ProductTable
          products={products}
          isLoading={isLoading}
          isError={isError}
          error={error}
          filters={filters}
          setFilters={setFilters}
          onDeleteClick={handleDeleteTrigger}
          onProductClick={(product) => setSelectedProduct(product)}
        />
        <LedgerBanner />
      </div>
    </div>
  );
};

export default ProductDirectory;
