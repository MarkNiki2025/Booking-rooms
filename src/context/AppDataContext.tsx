
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { getRooms } from "@/service/roomsService";
import { getBookings } from "@/service/bookingService";
import { getUsers } from "@/service/usersService";
import type { WithId } from "@/types";

import type { IRoom } from "@/types/room";
import type { IBooking } from "@/types/booking";
import type { IUser } from "@/types/user";

interface AppDataContextType {
  rooms: WithId<IRoom>[];
  bookings: WithId<IBooking>[];
  loading: boolean;
  users: WithId<IUser>[];
  refreshData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined
);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [rooms, setRooms] = useState<WithId<IRoom>[]>([]);
  const [bookings, setBookings] = useState<WithId<IBooking>[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<WithId<IUser>[]>([]);
  async function refreshData() {
    if (!user) return;

    setLoading(true);

    try {
      const [roomsData, bookingsData, usersData] = await Promise.all([
        getRooms(),
        getBookings(),
        getUsers(),
      ]);
      setUsers(usersData);
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
      value={{ rooms, bookings, loading, users, refreshData }}
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
