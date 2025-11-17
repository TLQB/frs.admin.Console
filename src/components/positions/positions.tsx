"use client"
import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Link from "next/link";
import { getListPositions, Position, deletePosition } from "@/services/api/employees";
import { useAuthContext } from "@/context/AuthContext";
import DataTable, { DataTableColumn } from "../common/DataTable";

interface PositionsProps {
    query?: string;
    onQueryChange?: (query: string) => void;
}

export default function Positions({ query: externalQuery, onQueryChange }: PositionsProps = {}) {
    const { userInfo } = useAuthContext();
    const [positions, setPositions] = useState<Position[]>([]);
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

    // Fetch positions data
    useEffect(() => {
        if (!userInfo?.isOrgAdmin && !userInfo?.isMaster) {
            setError("You don't have permission to view positions");
            setLoading(false);
            return;
        }

        const fetchPositions = async () => {
            try {
                setLoading(true);
                const response = await getListPositions();
                setPositions(Array.isArray(response) ? response : []);
            } catch (err) {
                console.error("Error fetching positions:", err);
                setError("Failed to load positions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, [userInfo]);

    if (!userInfo?.isOrgAdmin && !userInfo?.isMaster) {
        return (
            <div className="p-4 text-center text-gray-500">
                You don't have permission to view this page.
            </div>
        );
    }

    const columns: DataTableColumn<Position>[] = [
        { key: "id", header: "ID", className: "text-start" },
        { key: "name", header: "Name", className: "text-start" },
        { key: "level", header: "Level", className: "text-start", render: (r) => r.level ?? "-" },
        { key: "department", header: "Department", className: "text-start", render: (r) => (r.department ? `ID: ${r.department}` : "-") },
        {
            key: "actions",
            header: "Actions",
            className: "text-start",
            render: (row) => (
                <div className="flex gap-2">
                    <Link href={`/positions/${row.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            if (confirm(`Delete position "${row.name}"?`)) {
                                deletePosition(row.id).then(() => {
                                    setPositions(positions.filter(p => p.id !== row.id));
                                }).catch(err => {
                                    console.error("Delete error:", err);
                                    alert("Failed to delete position");
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

    const filtered = positions.filter((p) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return String(p.name || "").toLowerCase().includes(q);
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-4">
            <DataTable<Position>
                columns={columns}
                data={paginated}
                loading={loading}
                emptyText="No positions found"
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

