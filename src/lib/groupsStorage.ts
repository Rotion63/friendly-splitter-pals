
import { FriendGroup, Participant } from "./types";
import { generateId } from "./utils";

const GROUPS_STORAGE_KEY = "splitBillGroups";

// Get all groups from storage
export const getGroups = (): FriendGroup[] => {
  const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
  return storedGroups ? JSON.parse(storedGroups) : [];
};

// Get a specific group by ID
export const getGroupById = (id: string): FriendGroup | null => {
  const groups = getGroups();
  return groups.find(group => group.id === id) || null;
};

// Save a group (creates new or updates existing)
export const saveGroup = (group: FriendGroup): void => {
  const groups = getGroups();
  const existingGroupIndex = groups.findIndex(g => g.id === group.id);
  
  if (existingGroupIndex >= 0) {
    groups[existingGroupIndex] = group;
  } else {
    // If it's a new group without an ID, generate one
    if (!group.id) {
      group.id = generateId("group-");
    }
    groups.push(group);
  }
  
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
};

// Remove a group by ID
export const removeGroup = (id: string): void => {
  const groups = getGroups().filter(group => group.id !== id);
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
};

// Add member to a group
export const addMemberToGroup = (groupId: string, member: Participant): void => {
  const group = getGroupById(groupId);
  if (!group) return;
  
  // Check if member is already in the group
  if (!group.members.some(m => m.id === member.id)) {
    group.members.push(member);
    saveGroup(group);
  }
};

// Remove member from a group
export const removeMemberFromGroup = (groupId: string, memberId: string): void => {
  const group = getGroupById(groupId);
  if (!group) return;
  
  group.members = group.members.filter(member => member.id !== memberId);
  saveGroup(group);
};

// Create an empty group with just the name
export const createEmptyGroup = (name: string): FriendGroup => {
  return {
    id: generateId("group-"),
    name: name.trim(),
    members: [],
  };
};
