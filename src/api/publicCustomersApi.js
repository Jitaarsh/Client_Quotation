import axiosInstance from './axiosInstance';

export const getPublicCustomers = async () => {
  const response = await axiosInstance.get('/public/customers');
  return response.data;
};
