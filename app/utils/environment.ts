/**
 * Return true if development environment, return false if production environment.
 */
export function isDev(): boolean {
  return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
}
