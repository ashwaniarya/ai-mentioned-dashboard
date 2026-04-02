/**
 * Central flag for the design-system gallery route.
 * Set NEXT_PUBLIC_DESIGN_SYSTEM_ENABLED=false to hide /design-system in production builds.
 */
export function isDesignSystemRouteEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DESIGN_SYSTEM_ENABLED !== "false";
}
