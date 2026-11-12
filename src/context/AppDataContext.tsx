
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { getRooms, type AccessibleRoom } from "@/service/roomsService";
import { getBookings } from "@/service/bookingService";
import { getUsers } from "@/service/usersService";
import type { WithId } from "@/types";

import type { IBooking } from "@/types/booking";
import type { IUser } from "@/types/user";

interface AppDataContextType {
  rooms: AccessibleRoom[];
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

  const [rooms, setRooms] = useState<AccessibleRoom[]>([]);
  const [bookings, setBookings] = useState<WithId<IBooking>[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<WithId<IUser>[]>([]);
  const refreshData = useCallback(async () => {
    if (!user) {
      setRooms([]);
      setBookings([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const roomsData = await getRooms(user.uid);
      const [bookingsData, usersData] = await Promise.all([
        getBookings(roomsData.map((room) => room.id)),
        getUsers(),
      ]);

      setRooms(roomsData);
      setBookings(bookingsData);
      setUsers(usersData);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    void refreshData().catch((error: unknown) => {
      console.error("Error loading app data:", error);
    });
  }, [authLoading, refreshData]);

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
