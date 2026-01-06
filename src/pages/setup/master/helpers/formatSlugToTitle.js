export const formatSlugToTitle = (slug) => {
  if (!slug) return "";
  
  // Remove 'inital-info-' prefix if present (note: typo in backend)
  const withoutPrefix = slug.replace(/^inital-info-/, "");
  
  // Split by dash, capitalize each word, and join with spaces
  return withoutPrefix
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
