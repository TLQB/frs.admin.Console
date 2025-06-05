"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { createNotification, CreateNotificationData } from '@/services/api/notifications';
import { ChevronLeftIcon } from '@/icons';
import Link from 'next/link';
import Checkbox from '@/components/form/input/Checkbox';

export default function CreateNotificationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateNotificationData>({
        title: '',
        body: '',
        notification_type: 'topic',
        topic: 'all_users',
        data: {},
        urgent: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createNotification(formData);
            router.push('/notifications');
        } catch (error) {
            console.error('Error creating notification:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUrgentChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            urgent: checked
        }));
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Create Notification" />

            <div className="space-y-6">
                <ComponentCard title="Create New Notification">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Title */}
                            <div className="space-y-2">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:border-brand-600"
                                    placeholder="Enter notification title"
                                />
                            </div>

                            {/* Notification Type */}
                            <div className="space-y-2">
                                <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Notification Type
                                </label>
                                <select
                                    id="notification_type"
                                    name="notification_type"
                                    value={formData.notification_type}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-600"
                                >
                                    <option value="topic">Topic</option>
                                    <option value="device">Single Device</option>
                                    <option value="devices">Multiple Devices</option>
                                </select>
                            </div>

                            {/* Topic/Device Token */}
                            <div className="space-y-2">
                                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {formData.notification_type === 'topic' ? 'Topic' : 'Device Token'}
                                </label>
                                <input
                                    type="text"
                                    id="topic"
                                    name="topic"
                                    value={formData.topic || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:border-brand-600"
                                    placeholder={formData.notification_type === 'topic' ? 'Enter topic name' : 'Enter device token'}
                                />
                            </div>

                            {/* Urgent Option */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Priority
                                </label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="urgent"
                                        checked={formData.urgent || false}
                                        onChange={handleUrgentChange}
                                    />
                                    <label htmlFor="urgent" className="text-sm text-gray-700 dark:text-gray-200">
                                        Mark as Urgent
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-2">
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Message
                            </label>
                            <textarea
                                id="body"
                                name="body"
                                value={formData.body}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:border-brand-600"
                                placeholder="Enter notification message"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-4">
                            <Link href="/notifications">
                                <Button
                                    variant="outline"
                                    startIcon={<ChevronLeftIcon />}
                                >
                                    Back
                                </Button>
                            </Link>
                            <Button
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Notification'}
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}
