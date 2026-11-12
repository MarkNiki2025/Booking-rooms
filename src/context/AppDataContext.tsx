
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { getRooms } from "@/features/rooms/services/roomsService";
import { getBookings } from "@/features/bookings/services/bookingService";

import type { IRoom } from "@/types/room";
import type { IBooking } from "@/types/booking";

interface AppDataContextType {
  rooms: IRoom[];
  bookings: IBooking[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined
);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshData() {
    if (!user) return;

    setLoading(true);

    try {
      const [roomsData, bookingsData] = await Promise.all([
        getRooms(),
        getBookings(),
      ]);

      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error loading app data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRooms([]);
      setBookings([]);
      setLoading(false);
      return;
    }

    refreshData();
  }, [user, authLoading]);

  return (
    <AppDataContext.Provider
      value={{ rooms, bookings, loading, refreshData }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }

  return context;
}
