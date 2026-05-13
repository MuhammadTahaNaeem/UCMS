export const userQueryKeys = {
  dashboard: ["user-dashboard"],
  complaints: (params = {}) => ["user-complaints", params],
  complaintDetails: (id) => ["user-complaints", id],
  profile: ["user-profile"],
};
