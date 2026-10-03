export function getInitials(name) {
    if (!name) return "";
  
    const words = name.trim().split(/\s+/);
  
    // Take at most first 2 words
    const initials = words
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join("");
  
    return initials;
  }