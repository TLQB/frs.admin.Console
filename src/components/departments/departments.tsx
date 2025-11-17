"use client"
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Link from "next/link";
import Badge from "../ui/badge/Badge";
import { getListDepartments, Department, deleteDepartment } from "@/services/api/departments";
import { useAuthContext } from "@/context/AuthContext";
import { extractItems } from "@/services/api/utils";
import DataTable, { DataTableColumn } from "../common/DataTable";

interface DepartmentsProps {
    query?: string;
    onQueryChange?: (query: string) => void;
}

export default function Departments({ query: externalQuery, onQueryChange }: DepartmentsProps = {}) {
    const { userInfo, isLoading } = useAuthContext();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [internalQuery, setInternalQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [error, setError] = useState<string | null>(null);
    
    // Use external query if provided, otherwise use internal
    const query = externalQuery !== undefined ? externalQuery : internalQuery;
    const setQuery = onQueryChange || setInternalQuery;
    
    // Reset to page 1 when query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [query]);

    // Fetch departments data
    useEffect(() => {
        // Wait for user info to load
        if (isLoading) return;
        // If no userInfo yet (just mounted), avoid setting error early
        if (!userInfo) return;
        // Block access when role is clearly determined
        if (!userInfo.isOrgAdmin && !userInfo.isMaster) {
            setError("You don't have permission to view departments");
            setLoading(false);
            return;
        }

        const fetchDepartments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getListDepartments();
                const extracted = extractItems<Department>(response as any);
                setDepartments(extracted);
            } catch (err) {
                console.error("Error fetching departments:", err);
                setError("Failed to load departments. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, [userInfo, isLoading]);

    if (!isLoading && userInfo && !userInfo.isOrgAdmin && !userInfo.isMaster) {
        return (
            <div className="p-4 text-center text-gray-500">
                You don't have permission to view this page.
            </div>
        );
    }

    if (loading || isLoading) {
        return (
            <div className="p-4 text-center text-gray-500">
                Loading departments...
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

    const columns: DataTableColumn<Department>[] = [
        {
            key: "id",
            header: "ID",
            className: "text-start",
        },
        {
            key: "name",
            header: "Name",
            className: "text-start",
        },
        {
            key: "code",
            header: "Code",
            className: "text-start",
            render: (row) => row.code || "-",
        },
        {
            key: "parent",
            header: "Parent",
            className: "text-start",
            render: (row) => row.parent ? `ID: ${row.parent}` : "Root",
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
                    <Link href={`/departments/${row.id}`}>
                        <Button size="sm" variant="outline">
                            View
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            if (confirm(`Delete department "${row.name}"?`)) {
                                deleteDepartment(row.id)
                                    .then(() => {
                                        setDepartments(departments.filter(d => d.id !== row.id));
                                    })
                                    .catch(err => {
                                        // Error handled by alert
                                        alert("Failed to delete department");
                                    });
                            }
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const filtered = departments.filter((d) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            String(d.name || "").toLowerCase().includes(q) ||
            String(d.code || "").toLowerCase().includes(q)
        );
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-4">
            <DataTable<Department>
                columns={columns}
                data={paginated}
                loading={loading || isLoading}
                emptyText="No departments found"
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                showPagination={true}
            />
        </div>
    );
}

