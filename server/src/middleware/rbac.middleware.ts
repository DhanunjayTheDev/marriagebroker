import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission } from '../constants';
import { ROLE_PERMISSIONS } from '../constants/permissions';
import { ROLE_HIERARCHY } from '../constants/roles';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants';

export const requireRole = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
    }
    const userRole = req.user.role as UserRole;
    if (!roles.includes(userRole)) {
      return next(new AppError(ErrorCode.FORBIDDEN, 'Insufficient role', 403));
    }
    next();
  };

export const requireMinRole = (minRole: UserRole) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
    }
    const userRole = req.user.role as UserRole;
    if ((ROLE_HIERARCHY[userRole] ?? 0) < (ROLE_HIERARCHY[minRole] ?? 0)) {
      return next(new AppError(ErrorCode.FORBIDDEN, 'Insufficient permissions', 403));
    }
    next();
  };

export const requirePermission = (...permissions: Permission[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
    }
    const userRole = req.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] ?? [];

    const hasAll = permissions.every(p => userPermissions.includes(p));
    if (!hasAll) {
      return next(new AppError(ErrorCode.PERMISSION_DENIED, 'Permission denied', 403));
    }
    next();
  };

export const requireAnyPermission = (...permissions: Permission[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
    }
    const userRole = req.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] ?? [];

    const hasAny = permissions.some(p => userPermissions.includes(p));
    if (!hasAny) {
      return next(new AppError(ErrorCode.PERMISSION_DENIED, 'Permission denied', 403));
    }
    next();
  };

export const requireOwnerOrRole = (paramKey = 'userId', ...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
    }
    const isOwner = req.user.userId === req.params[paramKey];
    const userRole = req.user.role as UserRole;
    const isPrivileged = roles.includes(userRole);

    if (!isOwner && !isPrivileged) {
      return next(new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403));
    }
    next();
  };

export const requireStaff = requireMinRole(UserRole.SUPPORT);
export const requireAdmin = requireMinRole(UserRole.ADMIN);
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);
