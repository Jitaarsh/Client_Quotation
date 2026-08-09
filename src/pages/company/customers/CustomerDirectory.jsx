import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerApi from '../../../services/customerApi';

// Components
import CustomerDetailsModal from './components/CustomerDetailsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import CustomerHeader from './components/CustomerHeader';
import CustomerStats from './components/CustomerStats';
import CustomerTable from './components/CustomerTable';
import IntegrationsBanner from './components/IntegrationsBanner';

const CustomerDirectory = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // ── ESC Key Listener for Modal ──────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSelectedCustomer(null);
        setCustomerToDelete(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // ── Data Fetching ───────────────────────────────────────────
  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerApi.getCustomers
  });

  const customers = customersResponse?.data || [];

  // ── Mutations ───────────────────────────────────────────────
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSelectedCustomer(null);
      setCustomerToDelete(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete customer');
      setCustomerToDelete(null);
    }
  });

  const handleDelete = (e, customer) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
  };

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fcfcfd]">
      {/* Customer Quick View Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Customer Delete Confirmation Modal */}
      {customerToDelete && (
        <DeleteConfirmModal
          customer={customerToDelete}
          onClose={() => setCustomerToDelete(null)}
          onConfirm={() => deleteMutation.mutate(customerToDelete._id)}
          isDeleting={deleteMutation.isPending}
        />
      )}

      <CustomerHeader />
      <CustomerStats customersCount={customers.length} isLoading={isLoading} />
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        setSelectedCustomer={setSelectedCustomer}
        handleDelete={handleDelete}
        deleteMutation={deleteMutation}
      />
      <IntegrationsBanner />
    </div>
  );
};

export default CustomerDirectory;
