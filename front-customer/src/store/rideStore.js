import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRideStore = create(
  persist(
    (set, get) => ({
      selectedSource: null,
      selectedDestination: null,
      driver: null,
      requested: false,
      trip: null,

      setSelectedSource: (source) => set({ selectedSource: source }),
      setSelectedDestination: (destination) =>
        set({ selectedDestination: destination }),
      setDriver: (driverOrUpdater) => {
        const current = get().driver;
        const updated =
          typeof driverOrUpdater === 'function'
            ? driverOrUpdater(current)
            : driverOrUpdater;
        set({ driver: updated });
      },
      paymentStatus: null,
      setPaymentStatus: (status) => set({ status: status }),
      setRequested: (status) => set({ requested: status }),
      setTrip: (trip) => set({ trip })
    }),
    {
      name: 'ride-storage',
      getStorage: () => localStorage
    }
  )
);
