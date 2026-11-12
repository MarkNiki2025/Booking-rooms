export type { IUser } from "./user";

export type {
  IRoom,
  IRoomMember,
  RoomMemberRole,
} from "./room";

export type {
  IBooking,
  BookingStatus,
} from "./booking";

export type WithId<T> = T & {
  id: string;
};