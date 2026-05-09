import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState({
    deliveryEnabled: true,
    pickupEnabled: false,
    pickupInstructions: '',
    freeShippingThreshold: 999,
    shippingCost: 99,
    taxRate: 18,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/orders/settings/store');
      if (data.settings) setStoreSettings(data.settings);
    } catch {
      // default settings use karo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Admin settings change karne par refresh
    window.addEventListener('luxe_store_settings_updated', fetchSettings);
    return () => window.removeEventListener('luxe_store_settings_updated', fetchSettings);
  }, []);

  return (
    <StoreContext.Provider value={{ storeSettings, loading, fetchSettings }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
