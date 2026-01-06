// Filter sidebar items based on user permissions
export const filterItemsByPermissions = (items, userPermissions = []) => {
  if (!items || !Array.isArray(items)) return [];

  return items
    .filter((item) => {
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    })
    .map((item) => ({
      ...item,
      items: item.items
        ? filterItemsByPermissions(item.items, userPermissions)
        : [],
    }));
};

export const filterItemsByRole = (items, role) => {
  return items.filter((item) => !item.roles || item.roles.includes(role));
};
