import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { IRoom, RoomMemberRole } from "@/types/room";
import type { WithId } from "@/types";

export type AccessibleRoom = WithId<IRoom> & {
  memberRole: RoomMemberRole;
};

const managerRoles: RoomMemberRole[] = ["owner", "admin"];

function isRoomMemberRole(role: unknown): role is RoomMemberRole {
  return role === "owner" || role === "admin" || role === "member";
}

export async function getRooms(userUid: string): Promise<AccessibleRoom[]> {
  const snapshot = await getDocs(collection(db, "rooms"));

  const accessibleRooms = await Promise.all(
    snapshot.docs.map(async (item) => {
      const membership = await getDoc(
        doc(db, "rooms", item.id, "members", userUid)
      );

      if (!membership.exists()) return null;

      const role = membership.data().role;
      if (!isRoomMemberRole(role)) {
        throw new Error(`Room ${item.id} has an invalid member role.`);
      }

      const data = item.data();
      return {
        id: item.id,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        nameOfOwner: data.nameOfOwner ?? "",
        memberRole: role,
      };
    })
  );

  return accessibleRooms.filter((room) => room !== null);
}

async function assertCanManageRoom(
  roomId: string,
  userUid: string
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnapshot = await getDoc(roomRef);
  if (!roomSnapshot.exists()) {
    throw new Error("This room no longer exists.");
  }

  const membership = await getDoc(
    doc(db, "rooms", roomId, "members", userUid)
  );
  const role = membership.exists() ? membership.data().role : undefined;

  if (
    roomSnapshot.data().createdBy !== userUid &&
    (!isRoomMemberRole(role) || !managerRoles.includes(role))
  ) {
    throw new Error("You do not have permission to manage this room.");
  }
}

export async function updateRoom(
  roomId: string,
  userUid: string,
  changes: Pick<IRoom, "name" | "description">
): Promise<void> {
  await assertCanManageRoom(roomId, userUid);
  await updateDoc(doc(db, "rooms", roomId), changes);
}

export async function deleteRoom(
  roomId: string,
  userUid: string
): Promise<void> {
  await assertCanManageRoom(roomId, userUid);

  const membersSnapshot = await getDocs(
    collection(db, "rooms", roomId, "members")
  );
  const memberRefs = membersSnapshot.docs.map((member) => member.ref);

  for (let index = 0; index < memberRefs.length; index += 500) {
    const batch = writeBatch(db);
    memberRefs.slice(index, index + 500).forEach((memberRef) => {
      batch.delete(memberRef);
    });
    await batch.commit();
  }

  await deleteDoc(doc(db, "rooms", roomId));
}