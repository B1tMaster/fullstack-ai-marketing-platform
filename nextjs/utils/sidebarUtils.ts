export const getMobileClasses = (
  isMobile: boolean,
  isOpen: boolean
): string => {
  if (!isMobile) return "";
  const baseClasses = "fixed inset-y-0 left-0";
  return isOpen
    ? `${baseClasses} translate-x-0`
    : `${baseClasses} translate-x-full`;
};

export const getDesktopClasses = (
  isMobile: boolean,
  collapsed: boolean
): string => {
  if (isMobile) return "";
  return collapsed
    ? "w-28 h-screen sticky top-0"
    : "w-64 h-screen sticky top-0";
};
