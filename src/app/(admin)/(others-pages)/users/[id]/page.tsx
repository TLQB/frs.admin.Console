"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Textarea from "@/components/form/Textarea";

// Mock data for admin details based on id
const getUserData = (id: string) => {
    const adminId = parseInt(id);
    // This would be replaced with an API call in a real application
    return {
        id: adminId,
        username: ["Web Designer", "Project Manager", "Content Writing", "Digital Marketer", "Front-end Developer"][adminId % 5],
        email: "tlqbao@powake.dev",
        memo: adminId % 2 === 0 ? "This admin has full access to the system" : "Limited access admin account",
        is_master: adminId % 2 === 0,
        is_enable: adminId % 3 !== 0,
        last_login: "2023-05-15T10:30:00",
        created_at: "2023-01-01T08:00:00"
    };
};

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Mock data loading
    const userData = getUserData(id);

    const [formData, setFormData] = useState({
        username: userData.username,
        email: userData.email,
        memo: userData.memo || "",
        is_master: userData.is_master,
        is_enable: userData.is_enable
    });

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
        if (!formData.username || !formData.email) {
            setError("Please fill in all required fields");
            setIsSubmitting(false);
            return;
        }

        try {
            // Here you would make an API call to update the admin
            // For example:
            // const response = await fetch(`/api/admins/${id}`, {
            //   method: 'PUT',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData)
            // });

            // For demonstration, we'll just simulate a successful response
            console.log("Updating admin with data:", formData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

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
        router.push("/users");
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

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
                                <Label htmlFor="username" required>
                                    Username
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="username"
                                        name="username"
                                        placeholder="Enter username"
                                        defaultValue={formData.username}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
                                        {formData.username}
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
                                    placeholder="Add notes about this admin account"
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
                            {/* <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={formData.is_master}
                                    onChange={handleCheckboxChange("is_master")}
                                    disabled={!isEditing}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Is Master Admin
                                </span>
                            </div> */}

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={formData.is_enable}
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
                                        {formatDate(userData.created_at)}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="last-login">Last Login</Label>
                                    <div className="h-11 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
                                        {formatDate(userData.last_login)}
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