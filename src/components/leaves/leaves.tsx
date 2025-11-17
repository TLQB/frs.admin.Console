"use client"
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Link from "next/link";
import { getListLeaves, LeaveRequest, deleteLeave } from "@/services/api/leaves";
import { useAuthContext } from "@/context/AuthContext";
import DataTable, { DataTableColumn } from "../common/DataTable";

interface LeavesProps {
    query?: string;
    onQueryChange?: (query: string) => void;
}

export default function Leaves({ query: externalQuery, onQueryChange }: LeavesProps = {}) {
    const { userInfo } = useAuthContext();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    // Fetch leaves data
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                setLoading(true);
                const response = await getListLeaves();
                
                if (Array.isArray(response)) {
                    setLeaves(response);
                } else if (response && typeof response === 'object') {
                    if (Array.isArray(response.items)) {
                        setLeaves(response.items);
                    } else if (Array.isArray(response.data)) {
                        setLeaves(response.data);
                    } else if (response.data && typeof response.data === 'object' && 'items' in response.data && Array.isArray(response.data.items)) {
                        setLeaves(response.data.items);
                    }
                }
            } catch (err) {
                console.error("Error fetching leaves:", err);
                setError("Failed to load leave requests. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, []);

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-500">
                Loading leave requests...
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

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filtered = leaves.filter((l) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
    return (
            String(l.leave_type || "").toLowerCase().includes(q) ||
            String(l.reason || "").toLowerCase().includes(q) ||
            String(l.status || "").toLowerCase().includes(q)
        );
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const columns: DataTableColumn<LeaveRequest>[] = [
        {
            key: "id",
            header: "ID",
            className: "text-start",
        },
        {
            key: "leave_type",
            header: "Leave Type",
            className: "text-start",
        },
        {
            key: "start_date",
            header: "Start Date",
            className: "text-start",
            render: (row) => new Date(row.start_date).toLocaleDateString(),
        },
        {
            key: "end_date",
            header: "End Date",
            className: "text-start",
            render: (row) => new Date(row.end_date).toLocaleDateString(),
        },
        {
            key: "status",
            header: "Status",
            className: "text-start",
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(row.status)}`}>
                    {row.status || 'Pending'}
                                    </span>
            ),
        },
        {
            key: "reason",
            header: "Reason",
            className: "text-start",
            render: (row) => row.reason || '-',
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-start",
            render: (row) => (
                                    <div className="flex gap-2">
                    <Link href={`/leaves/${row.id}`}>
                                            <Button size="sm" variant="secondary">
                                                View
                                            </Button>
                                        </Link>
                    {(!row.status || row.status === 'pending') && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => {
                                                    if (confirm(`Delete leave request?`)) {
                                    deleteLeave(row.id).then(() => {
                                        setLeaves(leaves.filter(l => l.id !== row.id));
                                                        }).catch(err => {
                                                            console.error("Delete error:", err);
                                                            alert("Failed to delete leave request");
                                                        });
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <DataTable<LeaveRequest>
                columns={columns}
                data={paginated}
                loading={loading}
                emptyText="No leave requests found"
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

