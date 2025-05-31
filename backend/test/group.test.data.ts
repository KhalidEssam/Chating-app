export const groupTestData = {
  validGroup: {
    name: "Friends Chat",
    isActive: true,
    members: [1, 2, 3], // Assuming these are user IDs
  },

  groupWithOptionalFields: {
    name: "Work Team",
    isActive: false,
    members: [4, 5, 6],
  },

  groupWithNoMembers: {
    name: "Solo Project",
    isActive: true,
    members: [],
  },

  groupWithInvalidData: {
    name: "Invalid Group",
    isActive: "not a boolean", // Invalid type
    members: "not an array", // Invalid type
  },

  minimalGroup: {
    name: "Minimal Group",
    members: [7]
  }
};
