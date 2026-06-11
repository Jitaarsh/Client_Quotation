import { create } from 'zustand';

const initialFormState = {
  name: '',
  sku: '',
  category: '',
  description: '',
  basePrice: '',
  unit: 'unit',
  status: 'active',
  currency: 'INR',
  pricingTiers: [], // Array of { minQty: number, maxQty: number, price: number }
  portOfImport: '',
  addressDetail: '',
  productImage: null, // Stores File object for upload
  cataloguePdf: null  // Stores File object for upload
};

const useProductFormStore = create((set) => ({
  formData: initialFormState,
  
  // Update a simple string/number field
  setField: (field, value) => 
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value
      }
    })),

  // Initialize form for editing
  setFormData: (data) => set({ formData: { ...initialFormState, ...data } }),

  // Pricing Tiers Actions
  addTier: () => 
    set((state) => ({
      formData: {
        ...state.formData,
        pricingTiers: [
          ...state.formData.pricingTiers,
          { minQty: '', maxQty: '', price: '' } // Using string to allow typing numbers naturally, will cast before submit
        ]
      }
    })),

  updateTier: (index, field, value) => 
    set((state) => {
      const newTiers = [...state.formData.pricingTiers];
      newTiers[index] = { ...newTiers[index], [field]: value };
      return {
        formData: {
          ...state.formData,
          pricingTiers: newTiers
        }
      };
    }),

  removeTier: (index) => 
    set((state) => ({
      formData: {
        ...state.formData,
        pricingTiers: state.formData.pricingTiers.filter((_, i) => i !== index)
      }
    })),

  // Reset entirely
  resetForm: () => set({ formData: initialFormState })
}));

export default useProductFormStore;
