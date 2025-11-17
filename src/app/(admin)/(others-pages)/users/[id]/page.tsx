"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Textarea from "@/components/form/Textarea";
import { getDetailUser, updateUser, User } from "@/services/api/users";

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        memo: "",
        is_enabled: true
    });

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const data = await getDetailUser(id);
                setUserData(data);
                setFormData({
                    name: data.name,
                    email: data.email,
                    memo: (data.config?.memo as string) || "",
                    is_enabled: data.is_enabled
                });
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user information. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchUserData();
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
            if (!userData) {
                throw new Error("No user data available");
            }

            // Prepare update data
            const updateData = {
                ...userData,
                name: formData.name,
                email: formData.email,
                is_enabled: formData.is_enabled,
                config: {
                    ...userData.config,
                    memo: formData.memo
                }
            };

            // Call API to update user
            const updatedUser = await updateUser(id, updateData);
            
            // Update local state
            setUserData(updatedUser);
                            setFormData({
                    name: updatedUser.name,
                    email: updatedUser.email,
                    memo: (updatedUser.config?.memo as string) || "",
                    is_enabled: updatedUser.is_enabled
                });

            setSuccess("User updated successfully");
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating user:", err);
            setError("Failed to update user. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push("/users");
    };


    if (isLoading) {
        return (
            <div>
                <PageBreadcrumb pageTitle="User Details" />
                <div className="max-w-3xl mx-auto">
                    <ComponentCard title="Loading...">
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    </ComponentCard>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div>
                <PageBreadcrumb pageTitle="User Details" />
                <div className="max-w-3xl mx-auto">
                    <ComponentCard title="Error">
                        <div className="text-center py-8">
                            <p className="text-red-600">Failed to load user information</p>
                            <button
                                onClick={handleBack}
                                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                            >
                                Back to List
                            </button>
                        </div>
                    </ComponentCard>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="User Details" />

            <div className="max-w-3xl mx-auto">
                <ComponentCard title={isEditing ? "Edit User" : "User Details"}>
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
                                <Label htmlFor="name" required>
                                    Username
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="name"
                                        name="name"
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
                            <Label htmlFor="memo">
                                Memo {isEditing && <span className="text-xs text-gray-500">(Optional)</span>}
                            </Label>
                            {isEditing ? (
                                <Textarea
                                    id="memo"
                                    name="memo"
                                    placeholder="Add notes about this user account"
                                    defaultValue={formData.memo}
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
                                    checked={formData.is_enabled}
                                    onChange={handleCheckboxChange("is_enabled")}
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
                                                                    <Label htmlFor="mail-auth">Email Authentication</Label>
                                <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
                                    {userData.is_mailauth_completed ? "Verified" : "Not Verified"}
                                </div>
                                </div>

                                <div>
                                    <Label htmlFor="user-id">User ID</Label>
                                    <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
                                        {userData.id}
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
                                    Edit User
                                </button>
                            )}
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
} 