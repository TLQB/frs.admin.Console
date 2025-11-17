"use client"
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Link from "next/link";
import Badge from "../ui/badge/Badge";
import { getListEmployees, Employee, deleteEmployee } from "@/services/api/employees";
import { useAuthContext } from "@/context/AuthContext";
import { extractItems } from "@/services/api/utils";
import DataTable, { DataTableColumn } from "../common/DataTable";

interface EmployeesProps {
    query?: string;
    onQueryChange?: (query: string) => void;
}

export default function Employees({ query: externalQuery, onQueryChange }: EmployeesProps = {}) {
    const { userInfo, isLoading } = useAuthContext();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Search + Pagination state
    const [internalQuery, setInternalQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Use external query if provided, otherwise use internal
    const query = externalQuery !== undefined ? externalQuery : internalQuery;
    const setQuery = onQueryChange || setInternalQuery;
    
    // Reset to page 1 when query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [query]);

    // Delete confirmation dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch employees data
    useEffect(() => {
        if (isLoading) return;
        if (!userInfo?.isOrgAdmin && !userInfo?.isMaster) {
            setError("You don't have permission to view employees");
            setLoading(false);
            return;
        }

        const fetchEmployees = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getListEmployees();
                const extracted = extractItems<Employee>(response as any);
                setEmployees(extracted);
            } catch (err) {
                console.error("Error fetching employees:", err);
                setError("Failed to load employees. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [userInfo, isLoading]);

    const handleDelete = async (employee: Employee) => {
        setEmployeeToDelete(employee);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;
        
        try {
            setIsDeleting(true);
            await deleteEmployee(employeeToDelete.id);
            setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
            setShowDeleteDialog(false);
            setEmployeeToDelete(null);
        } catch (err) {
            console.error("Error deleting employee:", err);
            alert("Failed to delete employee. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isLoading && userInfo && !userInfo.isOrgAdmin && !userInfo.isMaster) {
        return (
            <div className="p-4 text-center text-gray-500">
                You don't have permission to view this page.
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                {error}
            </div>
        );
    }

    const filtered = employees.filter((e) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            String(e.full_name || "").toLowerCase().includes(q) ||
            String(e.employee_code || "").toLowerCase().includes(q) ||
            String(e.email || "").toLowerCase().includes(q) ||
            String(e.phone || "").toLowerCase().includes(q)
        );
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginatedEmployees = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns: DataTableColumn<Employee>[] = [
        {
            key: "id",
            header: "ID",
            className: "text-start",
        },
        {
            key: "full_name",
            header: "Full Name",
            className: "text-start",
            render: (row) => row.full_name || "-",
        },
        {
            key: "employee_code",
            header: "Employee Code",
            className: "text-start",
            render: (row) => {
                // Check if employee_code exists in row or in attributes
                const code = row.employee_code || row.attributes?.employee_code || row.attributes?.code;
                return code ? String(code) : "-";
            },
        },
        {
            key: "email",
            header: "Email",
            className: "text-start",
            render: (row) => {
                // Check if email exists in row or in attributes
                const email = row.email || row.attributes?.email;
                return email ? String(email) : "-";
            },
        },
        {
            key: "phone",
            header: "Phone",
            className: "text-start",
            render: (row) => {
                // Check if phone exists in row or in attributes
                const phone = row.phone || row.attributes?.phone;
                return phone ? String(phone) : "-";
            },
        },
        {
            key: "is_active",
            header: "Status",
            className: "text-start",
            render: (row) => (
                <Badge size="sm" color={row.is_active ? "success" : "error"}>
                    {row.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-start",
            render: (row) => (
                <div className="flex gap-2">
                    <Link href={`/employees/${row.id}`}>
                        <Button size="sm" variant="outline">
                            View
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(row)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <DataTable<Employee>
                columns={columns}
                data={paginatedEmployees}
                loading={loading || isLoading}
                emptyText="No employees found"
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                showPagination={true}
            />

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Delete Employee</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete <strong>{employeeToDelete?.full_name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setEmployeeToDelete(null);
                                }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

