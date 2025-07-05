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
import { getListUser, User, deleteUser, UserResponse } from "@/services/api/users"

export default function Users() {
    // State management
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(users.length / itemsPerPage);

    // Delete confirmation dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch users data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await getListUser();
                
                // Handle different response formats
                if (Array.isArray(response)) {
                    setUsers(response);
                } else if (response && typeof response === 'object') {
                    const typedResponse = response as UserResponse;
                    // Check if response has items property
                    if (Array.isArray(typedResponse.items)) {
                        setUsers(typedResponse.items);
                    } else if (Array.isArray(typedResponse.data)) {
                        setUsers(typedResponse.data);
                    } else if (typedResponse.data && typeof typedResponse.data === 'object' && 'items' in typedResponse.data && Array.isArray(typedResponse.data.items)) {
                        setUsers(typedResponse.data.items);
                    } else {
                        console.error('Unexpected API response format:', response);
                        setUsers([]);
                    }
                } else {
                    setUsers([]);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users");
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Get current items for display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination handlers
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Handle delete button click
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setShowDeleteDialog(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await deleteUser(userToDelete.id.toString());
            // Cập nhật lại danh sách users sau khi xóa
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
            setShowDeleteDialog(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle cancel delete
    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setUserToDelete(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {error}
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="w-full">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
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

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {currentItems.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                        <TableCell className="px-6 py-4 text-start">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {user.email}
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center">
                                                <Checkbox
                                                    checked={user.is_mailauth_completed}
                                                    disabled={true}
                                                    onChange={() => {}}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center">
                                                <Checkbox
                                                    checked={user.is_enabled}
                                                    disabled={true}
                                                    onChange={() => {}}
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/users/${user.id}`}>
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
                                                    onClick={() => handleDeleteClick(user)}
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
                            {Math.min(indexOfLastItem, users.length)}
                        </span>{" "}
                        of <span className="font-medium">{users.length}</span> results
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === 1
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
                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                                        currentPage === number
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
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === totalPages
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
                            Are you sure you want to delete the user account for <span className="font-semibold text-gray-800">{userToDelete?.name}</span>?
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
                                {isDeleting ? "Deleting..." : "Delete User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
