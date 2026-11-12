import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  getDocsFromServer,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Transaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BookingStatus, IBooking } from "@/types/booking";
import type { WithId } from "@/types";
import { bookingIntervalsOverlap } from "@/lib/bookingDateTime";

export class BookingConflictError extends Error {
  constructor() {
    super("This room already has an active booking during that time.");
    this.name = "BookingConflictError";
  }
}

export interface BookingInput {
  roomId: string;
  description: string;
  startAt: Date;
  endAt: Date;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`Booking has an invalid ${field} field.`);
  }
  return value;
}

function isTimestamp(value: unknown): value is Timestamp {
  return value instanceof Timestamp;
}

function normalizeBookingStatus(value: unknown): BookingStatus {
  if (value === "cancelled") return "cancelled";
  if (value === "active" || value === "pending" || value === "confirmed") {
    return "active";
  }
  throw new Error("Booking has an unsupported status.");
}

function parseBooking(
  snapshot: QueryDocumentSnapshot<DocumentData>
): WithId<IBooking> {
  const data = snapshot.data();
  const userId =
    typeof data.userId === "string"
      ? data.userId
      : requireString(data.createdBy, "userId");

  if (!isTimestamp(data.startAt) || !isTimestamp(data.endAt)) {
    throw new Error(`Booking ${snapshot.id} has invalid time data.`);
  }
  if (!isTimestamp(data.createdAt)) {
    throw new Error(`Booking ${snapshot.id} has an invalid creation time.`);
  }

  return {
    id: snapshot.id,
    roomId: requireString(data.roomId, "roomId"),
    userId,
    description: requireString(data.description, "description"),
    startAt: data.startAt,
    endAt: data.endAt,
    status: normalizeBookingStatus(data.status),
    createdAt: data.createdAt,
    attendeeIds: Array.isArray(data.attendeeIds)
      ? data.attendeeIds.filter(
          (attendeeId: unknown): attendeeId is string =>
            typeof attendeeId === "string"
        )
      : [],
  };
}

export async function getBookings(
  roomIds: string[]
): Promise<WithId<IBooking>[]> {
  const uniqueRoomIds = [...new Set(roomIds)];
  if (uniqueRoomIds.length === 0) return [];

  const snapshots = await Promise.all(
    uniqueRoomIds.map((roomId) =>
      getDocs(
        query(collection(db, "bookings"), where("roomId", "==", roomId))
      )
    )
  );

  return snapshots
    .flatMap((snapshot) => snapshot.docs.map(parseBooking))
    .sort((left, right) => left.startAt.toMillis() - right.startAt.toMillis());
}

function validateBookingDetails(
  description: string,
  startAt: Date,
  endAt: Date
): void {
  if (!description.trim()) throw new Error("Enter a booking description.");
  if (
    !(startAt instanceof Date) ||
    !(endAt instanceof Date) ||
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime())
  ) {
    throw new Error("Enter a valid booking date and time.");
  }
  if (endAt.getTime() <= startAt.getTime()) {
    throw new Error("The end time must be later than the start time.");
  }
  if (startAt.getTime() <= Date.now()) {
    throw new Error("A booking must start in the future.");
  }
}

function activeBookingsQuery(roomId: string) {
  return query(
    collection(db, "bookings"),
    where("roomId", "==", roomId)
  );
}

function bookingLockRef(roomId: string) {
  return doc(db, "rooms", roomId, "bookingLocks", "state");
}

function nextLockRevision(revision: unknown): number {
  return typeof revision === "number" ? revision + 1 : 1;
}

async function assertRoomManager(
  transaction: Transaction,
  roomId: string,
  userId: string
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const memberRef = doc(db, "rooms", roomId, "members", userId);
  const [roomSnapshot, memberSnapshot] = await Promise.all([
    transaction.get(roomRef),
    transaction.get(memberRef),
  ]);

  if (!roomSnapshot.exists()) {
    throw new Error("The selected room no longer exists.");
  }

  const role = memberSnapshot.exists()
    ? memberSnapshot.data().role
    : undefined;
  if (
    roomSnapshot.data().createdBy !== userId &&
    role !== "owner" &&
    role !== "admin"
  ) {
    throw new Error("Only room owners and admins can manage bookings.");
  }
}

function hasConflict(
  snapshots: readonly QueryDocumentSnapshot<DocumentData>[],
  startAt: Date,
  endAt: Date,
  excludeBookingId?: string
): boolean {
  return snapshots.some((snapshot) => {
    if (snapshot.id === excludeBookingId) return false;
    const data = snapshot.data();
    if (data.status === "cancelled") return false;
    if (!isTimestamp(data.startAt) || !isTimestamp(data.endAt)) {
      throw new Error(`Booking ${snapshot.id} has invalid time data.`);
    }

    return bookingIntervalsOverlap(
      data.startAt.toMillis(),
      data.endAt.toMillis(),
      startAt.getTime(),
      endAt.getTime()
    );
  });
}

export async function createBooking(
  input: BookingInput,
  userId: string
): Promise<string> {
  if (!input.roomId.trim()) throw new Error("Select a meeting room.");
  validateBookingDetails(input.description, input.startAt, input.endAt);
  const bookingRef = doc(collection(db, "bookings"));

  await runTransaction(db, async (transaction) => {
    await assertRoomManager(transaction, input.roomId, userId);
    const lockSnapshot = await transaction.get(bookingLockRef(input.roomId));
    const bookingsSnapshot = await getDocsFromServer(
      activeBookingsQuery(input.roomId)
    );

    if (
      hasConflict(
        bookingsSnapshot.docs,
        input.startAt,
        input.endAt
      )
    ) {
      throw new BookingConflictError();
    }

    transaction.set(bookingLockRef(input.roomId), {
      revision: nextLockRevision(
        lockSnapshot.exists() ? lockSnapshot.data().revision : undefined
      ),
      updatedAt: serverTimestamp(),
    });
    transaction.set(bookingRef, {
      roomId: input.roomId,
      userId,
      description: input.description.trim(),
      startAt: Timestamp.fromDate(input.startAt),
      endAt: Timestamp.fromDate(input.endAt),
      status: "active",
      createdAt: serverTimestamp(),
      attendeeIds: [userId],
    });
  });

  return bookingRef.id;
}

export async function updateBooking(
  bookingId: string,
  userId: string,
  input: Pick<BookingInput, "description" | "startAt" | "endAt">
): Promise<void> {
  validateBookingDetails(input.description, input.startAt, input.endAt);
  const bookingRef = doc(db, "bookings", bookingId);

  await runTransaction(db, async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);
    if (!bookingSnapshot.exists()) {
      throw new Error("This booking no longer exists.");
    }

    const booking = bookingSnapshot.data();
    const roomId = requireString(booking.roomId, "roomId");
    await assertRoomManager(transaction, roomId, userId);
    const lockSnapshot = await transaction.get(bookingLockRef(roomId));
    const bookingsSnapshot = await getDocsFromServer(
      activeBookingsQuery(roomId)
    );

    if (booking.status === "cancelled") {
      throw new Error("A cancelled booking cannot be edited.");
    }
    if (
      hasConflict(
        bookingsSnapshot.docs,
        input.startAt,
        input.endAt,
        bookingId
      )
    ) {
      throw new BookingConflictError();
    }

    transaction.set(bookingLockRef(roomId), {
      revision: nextLockRevision(
        lockSnapshot.exists() ? lockSnapshot.data().revision : undefined
      ),
      updatedAt: serverTimestamp(),
    });
    transaction.update(bookingRef, {
      description: input.description.trim(),
      startAt: Timestamp.fromDate(input.startAt),
      endAt: Timestamp.fromDate(input.endAt),
    });
  });
}

export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<void> {
  const bookingRef = doc(db, "bookings", bookingId);

  await runTransaction(db, async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);
    if (!bookingSnapshot.exists()) {
      throw new Error("This booking no longer exists.");
    }

    const roomId = requireString(bookingSnapshot.data().roomId, "roomId");
    await assertRoomManager(transaction, roomId, userId);
    const lockRef = bookingLockRef(roomId);
    const lockSnapshot = await transaction.get(lockRef);

    transaction.set(lockRef, {
      revision: nextLockRevision(
        lockSnapshot.exists() ? lockSnapshot.data().revision : undefined
      ),
      updatedAt: serverTimestamp(),
    });
    transaction.update(bookingRef, { status: "cancelled" });
  });
}

export async function joinBooking(
  bookingId: string,
  userId: string
): Promise<void> {
  const bookingRef = doc(db, "bookings", bookingId);

  await runTransaction(db, async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);
    if (!bookingSnapshot.exists()) {
      throw new Error("This booking no longer exists.");
    }

    const booking = bookingSnapshot.data();
    const roomId = requireString(booking.roomId, "roomId");
    const memberRef = doc(db, "rooms", roomId, "members", userId);
    const memberSnapshot = await transaction.get(memberRef);

    if (!memberSnapshot.exists()) {
      throw new Error("Only members of this room can join its bookings.");
    }
    if (booking.status === "cancelled") {
      throw new Error("You cannot join a cancelled booking.");
    }

    transaction.update(bookingRef, {
      attendeeIds: arrayUnion(userId),
    });
  });
}
