"use client"

import React, { useEffect, useState } from 'react';
import { getNotifications, Notification, deleteNotification } from '@/services/api/notifications';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import { EyeIcon, TrashBinIcon } from '@/icons';

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (id: number) => {
        router.push(`/notifications/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await deleteNotification(id);
                setNotifications(notifications.filter(notification => notification.id !== id));
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full">
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                            Title
                        </th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Type
                        </th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Topic/Device
                        </th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Status
                        </th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Created
                        </th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((notification) => (
                        <tr key={notification.id}>
                            <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                <h5 className="font-medium text-black dark:text-white">
                                    {notification.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{notification.body}</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <span 
                                    className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium"
                                    style={{ color: '#10B981' }}
                                >
                                    {notification.notification_type}
                                </span>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-black dark:text-white">
                                {notification.topic || notification.device_token || 'N/A'}
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
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
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-black dark:text-white">
                                {format(new Date(notification.created), 'dd/MM/yyyy HH:mm')}
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <div className="flex items-center space-x-3.5">
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleView(notification.id)}
                                    >
                                        <EyeIcon />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(notification.id)}
                                    >
                                        <TrashBinIcon />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Notifications;
