
import { Participant } from "./types";

const FRIENDS_STORAGE_KEY = "splitBillFriends";

export const getFriends = (): Participant[] => {
  const storedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);
  return storedFriends ? JSON.parse(storedFriends) : [];
};

export const addFriend = (friend: Participant): Participant[] => {
  const friends = getFriends();
  const updatedFriends = [...friends, friend];
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updatedFriends));
  return updatedFriends;
};

export const removeFriend = (id: string): Participant[] => {
  const friends = getFriends();
  const updatedFriends = friends.filter(friend => friend.id !== id);
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updatedFriends));
  return updatedFriends;
};

export const updateFriends = (friends: Participant[]): void => {
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
};
