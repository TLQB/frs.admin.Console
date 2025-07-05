"use client"

import React, { useEffect, useState } from 'react';
import { getNotifications, Notification, deleteNotification } from '@/services/api/notifications';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import { EyeIcon, TrashBinIcon } from '@/icons';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

// Define possible API response types
interface NotificationsResponse {
    success?: boolean;
    message?: string;
    items?: Notification[];
    data?: Notification[] | {
        items?: Notification[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    // Delete confirmation dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getNotifications();
            console.log("API response:", response);
            
            // Handle both array responses and object responses with items property
            if (Array.isArray(response)) {
                setNotifications(response);
            } else if (response && typeof response === 'object') {
                const typedResponse = response as NotificationsResponse;
                
                // Check for nested data.items structure
                if (typedResponse.data && typeof typedResponse.data === 'object' && 'items' in typedResponse.data && Array.isArray(typedResponse.data.items)) {
                    setNotifications(typedResponse.data.items);
                }
                // Check if response has items property directly
                else if (Array.isArray(typedResponse.items)) {
                    setNotifications(typedResponse.items);
                } 
                // Check if response has data property as array
                else if (Array.isArray(typedResponse.data)) {
                    setNotifications(typedResponse.data);
                } else {
                    // Fallback to empty array if no valid data structure found
                    console.error('Unexpected API response format:', response);
                    setNotifications([]);
                }
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (id: number) => {
        router.push(`/notifications/${id}`);
    };

    const handleDeleteClick = (notification: Notification) => {
        setNotificationToDelete(notification);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!notificationToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteNotification(notificationToDelete.id);
            setNotifications(notifications.filter(item => item.id !== notificationToDelete.id));
            setShowDeleteDialog(false);
            setNotificationToDelete(null);
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setNotificationToDelete(null);
    };

    // Get current items for display
    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = notifications.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination handlers
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                                        className="w-[30%] px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
                                    >
                                        Title
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
                                    >
                                        Type
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
                                    >
                                        Topic/Device
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-center text-theme-sm dark:text-gray-300"
                                    >
                                        Status
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[15%] px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
                                    >
                                        Created
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="w-[10%] px-6 py-4 font-medium text-gray-600 text-center text-theme-sm dark:text-gray-300"
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {currentItems.map((notification) => (
                                    <TableRow
                                        key={notification.id}
                                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                        <TableCell className="px-6 py-4 text-start">
                                            <div>
                                                <h5 className="font-medium text-black dark:text-white">
                                                    {notification.title}
                                                </h5>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{notification.body}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-start">
                                            <span 
                                                className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium"
                                                style={{ color: '#10B981' }}
                                            >
                                                {notification.notification_type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-start text-gray-500 dark:text-gray-400">
                                            {notification.topic || notification.device_token || 'N/A'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span 
                                                className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                                                    notification.is_sent 
                                                        ? 'bg-success bg-opacity-10'
                                                        : 'bg-warning bg-opacity-10'
                                                }`}
                                                style={{ color: notification.is_sent ? '#10B981' : '#F59E0B' }}
                                            >
                                                {notification.is_sent ? 'Sent' : 'Pending'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-start text-gray-500 dark:text-gray-400">
                                            {format(new Date(notification.created), 'dd/MM/yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium"
                                                    onClick={() => handleView(notification.id)}
                                                >
                                                    <EyeIcon />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium"
                                                    onClick={() => handleDeleteClick(notification)}
                                                >
                                                    <TrashBinIcon />
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
                            {Math.min(indexOfLastItem, notifications.length)}
                        </span>{" "}
                        of <span className="font-medium">{notifications.length}</span> results
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
                            Are you sure you want to delete the notification <span className="font-semibold text-gray-800">{notificationToDelete?.title}</span>?
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
                                {isDeleting ? "Deleting..." : "Delete Notification"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Notifications;