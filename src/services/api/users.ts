// Wrapper for backward compatibility - maps to employees service
// This file maintains compatibility with existing code that uses 'users' service
// while using the new 'employees' API endpoints

import {
    getListEmployees,
    getDetailEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    Employee,
    EmployeeResponse,
    CreateEmployeeData,
} from './employees';

// Re-export types with User alias for backward compatibility
export type User = Employee;
export type UserResponse = EmployeeResponse;
export type CreateUserData = CreateEmployeeData;

// Map functions to employees service
export const getListUser = getListEmployees;
export const getDetailUser = getDetailEmployee;
export const createUser = createEmployee;
export const updateUser = updateEmployee;
export const deleteUser = deleteEmployee;
