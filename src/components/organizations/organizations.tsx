"use client"
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import { getListTenants, deleteTenant, Tenant } from "@/services/api/organizations";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function Organizations() {
    const { userInfo } = useAuthContext();
    const [organizations, setOrganizations] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const formatDate = (iso?: string) => {
        if (!iso) return "-";
        try {
            const d = new Date(iso);
            return d.toLocaleDateString();
        } catch {
            return iso;
        }
    };

    // Fetch organizations data
    useEffect(() => {
        // Only fetch if user is master
        if (!userInfo) {
            setLoading(false);
            return;
        }

        if (!userInfo.isMaster) {
            setError("Only master users can view organizations");
            setLoading(false);
            return;
        }

        const fetchOrganizations = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getListTenants();
                // Normalize various possible response shapes → Tenant[]
                let items: Tenant[] = [];
                const anyData: any = data as any;
                if (Array.isArray(anyData)) {
                    items = anyData as Tenant[];
                } else if (Array.isArray(anyData?.data?.items)) {
                    items = anyData.data.items as Tenant[];
                } else if (Array.isArray(anyData?.items)) {
                    items = anyData.items as Tenant[];
                } else if (Array.isArray(anyData?.data?.data?.items)) {
                    // Some wrappers: { data: { success, data: { items: [] } } }
                    items = anyData.data.data.items as Tenant[];
                }
                setOrganizations(items || []);
            } catch (err: any) {
                console.error("Error fetching organizations:", err);
                // Check if it's a permission error from API
                if (err?.response?.status === 403 || err?.response?.status === 401) {
                    setError("You don't have permission to view organizations. Only master users can access this page.");
                } else {
                    setError("Failed to load organizations. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, [userInfo]);

    if (!userInfo?.isMaster) {
        return (
            <div className="p-4 text-center text-gray-500">
                You don't have permission to view this page.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Schema Name</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, idx) => (
                            <TableRow key={idx}>
                                <td className="py-4">
                                    <div className="h-3 w-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </td>
                                <td className="py-4">
                                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </td>
                                <td className="py-4">
                                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </td>
                                <td className="py-4">
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </td>
                                <td className="py-4">
                                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </td>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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

    // Filtering + pagination
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = organizations.filter((o) =>
        !normalizedSearch ||
        o.name?.toLowerCase().includes(normalizedSearch) ||
        o.schema_name?.toLowerCase().includes(normalizedSearch)
    );
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIdx = (safeCurrentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalItems);
    const pageItems = filtered.slice(startIdx, endIdx);

    const handleEdit = (tenant: Tenant) => {
        router.push(`/organizations/${tenant.id}`);
    };

    const handleDeleteClick = (tenant: Tenant) => {
        setTenantToDelete(tenant);
        setShowDeleteDialog(true);
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setTenantToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!tenantToDelete) return;
        try {
            setIsDeleting(true);
            await deleteTenant(tenantToDelete.id);
            setOrganizations(prev => prev.filter(t => t.id !== tenantToDelete.id));
            setShowDeleteDialog(false);
            setTenantToDelete(null);
        } catch (err) {
            console.error("Delete tenant failed:", err);
            alert("Failed to delete organization. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
            {/* Inner Card Header (Toolbar) */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span>Show</span>
                    <select
                        className="border rounded-md px-2 py-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[10, 25, 50, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span>entries</span>
                </div>

                <div className="relative w-full sm:w-80">
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Search..."
                        className="w-full border rounded-md px-3 py-2 pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
            </div>

            {/* Inner Card Body (Table) */}
            <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1102px]">
            <Table>
                {/* Fix column widths for balanced layout */}
                <colgroup>
                    <col style={{ width: "80px" }} />
                    <col />
                    <col style={{ width: "180px" }} />
                    <col style={{ width: "160px" }} />
                    <col style={{ width: "120px" }} />
                </colgroup>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                        <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                        <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                        <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Schema Name</TableCell>
                        <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created At</TableCell>
                        <TableCell className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                    </TableRow>
                </TableHeader>
                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {pageItems.length === 0 ? (
                        <TableRow>
                            <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-2xl">🗂️</span>
                                    <span className="text-sm">No organizations found</span>
                                </div>
                            </td>
                        </TableRow>
                    ) : (
                        pageItems
                            .slice()
                            .sort((a, b) => (a.id > b.id ? -1 : 1))
                            .map((org) => (
                                <TableRow key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <TableCell className="px-5 py-4 sm:px-6 text-start font-medium">{org.id}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">{org.name}</TableCell>
                                    <TableCell className="px-4 py-3 text-start">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {org.schema_name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(org.created_at)}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                aria-label="Edit organization"
                                                className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                onClick={() => handleEdit(org)}
                                            >
                                                <PencilIcon />
                                            </button>
                                            <button
                                                aria-label="Delete"
                                                className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-gray-200 text-red-600 hover:bg-red-50 dark:border-gray-800 dark:hover:bg-red-950/20"
                                                onClick={() => handleDeleteClick(org)}
                                            >
                                                <TrashBinIcon />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                    )}
                </TableBody>
            </Table>
            </div>
            </div>

            {/* Inner Card Footer (Pagination) */}
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-gray-500 border-t border-gray-200 dark:border-gray-800">
                <div>
                    {totalItems > 0 ? (
                        <span>
                            Showing {startIdx + 1} to {endIdx} of {totalItems} entries
                        </span>
                    ) : (
                        <span>Showing 0 to 0 of 0 entries</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className={`px-3 py-1 rounded-md border border-gray-200 dark:border-gray-800 ${safeCurrentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                        onClick={() => safeCurrentPage > 1 && setCurrentPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                        const page = idx + 1;
                        const active = page === safeCurrentPage;
                        return (
                            <button
                                key={page}
                                className={`w-8 h-8 rounded-md border text-sm ${active ? "bg-brand-500 text-white border-brand-500" : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        className={`px-3 py-1 rounded-md border border-gray-200 dark:border-gray-800 ${safeCurrentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                        onClick={() => safeCurrentPage < totalPages && setCurrentPage(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Delete Organization</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete <span className="font-medium">{tenantToDelete?.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button size="sm" variant="outline" onClick={handleDeleteCancel}>Cancel</Button>
                            <Button size="sm" variant="primary" onClick={handleDeleteConfirm}>
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

