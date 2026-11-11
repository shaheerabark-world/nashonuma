/** The six roles of the web app (see NAV in the React app's src/data/mock/app.ts). */
export enum Role {
  Supervisor = 'supervisor',
  Clinician = 'clinician',
  Programme = 'programme',
  Researcher = 'researcher',
  Admin = 'admin',
  Parent = 'parent'
}

/** Clinic staff: everyone except the parent. */
export const STAFF_ROLES = [Role.Supervisor, Role.Clinician, Role.Programme, Role.Researcher, Role.Admin];

/** The user attached to a request by JwtStrategy. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
