import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTripStore = create(
  persist(
    (set, get) => ({
      trip: null,
      setTrip: (trip) => set({ trip }),
      resetTrip: () => set({ trip: null }),
      paymentStatus: null,
      setPaymentStatus: (status) => set({ status: status })
    }),
    {
      name: 'trip-storage', // key in localStorage
      getStorage: () => localStorage // (default)
    }
  )
);

export default useTripStore;
