/** Verified NGO/admin/super-admin accounts can organize high-trust community-facing things (campaigns, communities). */
export function canOrganize(role: string | undefined, isVerified: boolean | undefined): boolean {
  return Boolean(isVerified && role && ["ngo", "admin", "super_admin"].includes(role));
}
