"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Textarea from "@/components/form/Textarea";
import { getDetailAdmin, Admin, updateAdmin } from "@/services/api/admins"

export default function AdminDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [adminData, setAdminData] = useState<Admin | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        config: '',
        is_master: false,
        is_enable: false,
    });
    const [loading, setLoading] = useState(true);

    const getAdminData = async (id: string) => {
        try {
            const admin = await getDetailAdmin(id);
            return admin;
        } catch (error) {
            console.error('Error fetching admin data:', error);
            return null;
        }
    };

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                setLoading(true);
                const data = await getAdminData(id);
                if (data) {
                    setAdminData(data);
                    setFormData({
                        name: data.name,
                        email: data.email,
                        config: data.config || {},
                        is_master: data.is_master,
                        is_enabled: data.is_enabled,
                    });
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (name: string) => (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        // Validation
        if (!formData.name || !formData.email) {
            setError("Please fill in all required fields");
            setIsSubmitting(false);
            return;
        }

        try {

            console.log("Updating admin with data:", formData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = await updateAdmin(id, formData);
            console.log(response)
            setSuccess("Admin updated successfully");
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating admin:", err);
            setError("Failed to update admin. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push("/admins");
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Admin Details" />

            <div className="max-w-3xl mx-auto">
                <ComponentCard title={isEditing ? "Edit Admin" : "Admin Details"}>
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="username" required>
                                    Username
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="username"
                                        name="username"
                                        placeholder="Enter username"
                                        defaultValue={formData.name}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
                                        {formData.name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email" required>
                                    Email
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        defaultValue={formData.email}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
                                        {formData.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="config">
                                Memo {isEditing && <span className="text-xs text-gray-500">(Optional)</span>}
                            </Label>
                            {isEditing ? (
                                <Textarea
                                    id="config"
                                    name="config"
                                    placeholder="Add notes about this admin account"
                                    defaultValue={formData.config}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            ) : (
                                <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90 min-h-[80px]">
                                    {formData.memo || "No additional notes"}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={formData.is_master}
                                    onChange={handleCheckboxChange("is_master")}
                                    disabled={!isEditing}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Is Master Admin
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={formData.is_enabled}
                                    onChange={handleCheckboxChange("is_enable")}
                                    disabled={!isEditing}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Is Enabled
                                </span>
                            </div>
                        </div>

                        {!isEditing && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="created-at">Created At</Label>
                                    <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">

                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="last-login">Last Login</Label>
                                    <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">

                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                Back to List
                            </button>

                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
                                >
                                    Edit Admin
                                </button>
                            )}
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
} 