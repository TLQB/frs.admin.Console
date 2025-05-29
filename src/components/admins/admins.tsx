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
import Checkbox from "../form/input/Checkbox";
import Link from "next/link";
import { getListAdmin, Admin, deleteAdmin, checkRefreshToken } from "@/services/api/admins"

export default function Admins() {
    // State for admin list
    const [tableData, setTableData] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch admin list
    const fetchAdmins = async () => {
        try {
            setIsLoading(true);
            const admins = await getListAdmin();
            setTableData(admins);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchAdmins();
    }, []);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    // Delete confirmation dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get current items for display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Handle delete button click
    const handleDeleteClick = (admin: Admin) => {
        setAdminToDelete(admin);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!adminToDelete) return;

        setIsDeleting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await deleteAdmin(adminToDelete.id);
            
            // Refresh admin list after deletion
            await fetchAdmins();

            // Close dialog
            setShowDeleteDialog(false);
            setAdminToDelete(null);

        } catch (error) {
            console.error("Error deleting admin:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle cancel
    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setAdminToDelete(null);
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="w-full">
                        <Table>
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="w-[25%] px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
                                    >
                                        ID
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[25%] px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
                                    >
                                        Name
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[30%] px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
                                    >
                                        Email
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-center text-theme-sm dark:text-gray-300"
                                    >
                                        Is Master
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-center text-theme-sm dark:text-gray-300"
                                    >
                                        Is Mailauth Completed
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-center text-theme-sm dark:text-gray-300"
                                    >
                                        Is Enable
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-center text-theme-sm dark:text-gray-300"
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {currentItems.map((admin) => (
                                    <TableRow
                                        key={admin.id}
                                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                        <TableCell className="px-6 py-4 text-start">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {admin.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-start">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {admin.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {admin.email}
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center">
                                                <Checkbox
                                                    checked={admin.is_master}
                                                    disabled={true}
                                                    onChange={() => { }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center">
                                                <Checkbox
                                                    checked={admin.is_mailauth_completed}
                                                    disabled={true}
                                                    onChange={() => { }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center">
                                                <Checkbox
                                                    checked={admin.is_enabled}
                                                    disabled={true}
                                                    onChange={() => { }}
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/admins/${admin.id}`}>
                                                    <Button
                                                        size="sm"
                                                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium"
                                                    >
                                                        Detail
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium"
                                                    onClick={() => handleDeleteClick(admin)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                        <span className="font-medium">
                            {Math.min(indexOfLastItem, tableData.length)}
                        </span>{" "}
                        of <span className="font-medium">{tableData.length}</span> results
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 1
                                ? "bg-blue-100/50 text-blue-300 cursor-not-allowed dark:bg-blue-900/20 dark:text-blue-700"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                }`}
                        >
                            Previous
                        </button>

                        <div className="flex items-center">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === number
                                        ? "bg-indigo-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                                : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the admin account for <span className="font-semibold text-gray-800">{adminToDelete?.name}</span>?
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                                className="px-5 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Deleting..." : "Delete Admin"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
