export function checkPermission(user: any, _action: string) {
  // Placeholder permission logic
  if (!user) {
    return false;
  }
  return true; // allow everything for now
}