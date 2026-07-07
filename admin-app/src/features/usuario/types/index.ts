import type { UserRole } from "../../auth/types";

export interface UserAdminUpdate {
  roles?: UserRole[];
  nombre?: string;
  apellido?: string;
  email?: string;
}
