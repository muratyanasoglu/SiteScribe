import { Role } from '@prisma/client';

export const ROLES_ORDER: Role[] = ['VIEWER', 'SUBCONTRACTOR', 'FIELD', 'PM', 'OWNER'];

export function hasMinimumRole(userRole: Role, required: Role): boolean {
  const ui = ROLES_ORDER.indexOf(userRole);
  const ri = ROLES_ORDER.indexOf(required);
  return ui >= 0 && ri >= 0 && ui >= ri;
}

export function canManageOrg(userRole: Role): boolean {
  return userRole === 'OWNER';
}

export function canManageProject(userRole: Role): boolean {
  return hasMinimumRole(userRole, 'PM');
}

export function canUploadEvidence(userRole: Role): boolean {
  return hasMinimumRole(userRole, 'FIELD');
}

export function canTriageSignals(userRole: Role): boolean {
  return hasMinimumRole(userRole, 'PM');
}

export function canEditChangeOrder(userRole: Role): boolean {
  return hasMinimumRole(userRole, 'PM');
}

export function canExport(userRole: Role): boolean {
  return hasMinimumRole(userRole, 'FIELD');
}

export function canComment(userRole: Role): boolean {
  return hasMinimumRole(userRole, 'FIELD');
}
