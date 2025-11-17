"use client"
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Link from "next/link";
import { getListCheckins, Checkin } from "@/services/api/attendance";
import DataTable, { DataTableColumn } from "../common/DataTable";

interface AttendanceProps {
    query?: string;
    onQueryChange?: (query: string) => void;
}

export default function Attendance({ query: externalQuery, onQueryChange }: AttendanceProps = {}) {
    const [checkins, setCheckins] = useState<Checkin[]>([]);
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

    // Fetch checkins data
    useEffect(() => {
        const fetchCheckins = async () => {
            try {
                setLoading(true);
                const response = await getListCheckins();
                
                if (Array.isArray(response)) {
                    setCheckins(response);
                } else if (response && typeof response === 'object') {
                    if (Array.isArray(response.items)) {
                        setCheckins(response.items);
                    } else if (Array.isArray(response.data)) {
                        setCheckins(response.data);
                    } else if (response.data && typeof response.data === 'object' && 'items' in response.data && Array.isArray(response.data.items)) {
                        setCheckins(response.data.items);
                    }
                }
            } catch (err) {
                console.error("Error fetching checkins:", err);
                setError("Failed to load attendance records. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCheckins();
    }, []);

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-500">
                Loading attendance records...
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

    const filtered = checkins.filter((c) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
    return (
            String(c.location || "").toLowerCase().includes(q) ||
            String(c.device_id || "").toLowerCase().includes(q) ||
            String(c.checkin_type || "").toLowerCase().includes(q)
        );
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const columns: DataTableColumn<Checkin>[] = [
        {
            key: "id",
            header: "ID",
            className: "text-start",
        },
        {
            key: "timestamp",
            header: "Timestamp",
            className: "text-start",
            render: (row) => row.timestamp ? new Date(row.timestamp).toLocaleString() : '-',
        },
        {
            key: "checkin_type",
            header: "Type",
            className: "text-start",
            render: (row) => (
                                    <span className={`px-2 py-1 rounded text-xs ${
                    row.checkin_type === 'checkin' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-purple-100 text-purple-800'
                                    }`}>
                    {row.checkin_type || 'Check-in'}
                                    </span>
            ),
        },
        {
            key: "location",
            header: "Location",
            className: "text-start",
            render: (row) => row.location || '-',
        },
        {
            key: "device_id",
            header: "Device ID",
            className: "text-start",
            render: (row) => row.device_id || '-',
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-start",
            render: (row) => (
                <Link href={`/attendance/${row.id}`}>
                                        <Button size="sm" variant="secondary">
                                            View
                                        </Button>
                                    </Link>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <DataTable<Checkin>
                columns={columns}
                data={paginated}
                loading={loading}
                emptyText="No attendance records found"
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

