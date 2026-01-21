import { Participant } from "./types";
import { safeParseParticipants } from "./storageSchemas";

const FRIENDS_STORAGE_KEY = "splitBillFriends";

export const getFriends = (): Participant[] => {
  try {
    const storedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!storedFriends) return [];
    const parsed = JSON.parse(storedFriends);
    return safeParseParticipants(parsed, 'friends');
  } catch (error) {
    console.error("Error loading friends:", error);
    return [];
  }
};

export const saveFriend = (friend: Participant): Participant[] => {
  const friends = getFriends();
  const updatedFriends = [...friends, friend];
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updatedFriends));
  return updatedFriends;
};

export const addFriend = saveFriend; // For backward compatibility

export const removeFriend = (id: string): Participant[] => {
  const friends = getFriends();
  const updatedFriends = friends.filter(friend => friend.id !== id);
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updatedFriends));
  return updatedFriends;
};

export const updateFriends = (friends: Participant[]): void => {
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
};
