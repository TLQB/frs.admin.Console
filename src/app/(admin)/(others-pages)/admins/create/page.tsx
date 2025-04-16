"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Textarea from "@/components/form/Textarea";
import { EyeCloseIcon, EyeIcon } from "@/icons";

export default function CreateAdminPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        memo: "",
        is_master: false,
        is_enable: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        setIsSubmitting(true);

        // Validation
        if (!formData.username || !formData.email) {
            setError("Please fill in all required fields");
            setIsSubmitting(false);
            return;
        }

        try {
            // Here you would make an API call to create the admin
            // For example:
            // const response = await fetch('/api/admins', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData)
            // });

            // For demonstration, we'll just simulate a successful response
            console.log("Creating admin with data:", formData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect back to admin list
            router.push("/admins");
        } catch (err) {
            console.error("Error creating admin:", err);
            setError("Failed to create admin. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Create Admin" />

            <div className="max-w-3xl mx-auto">
                <ComponentCard title="Add New Admin">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="username" required>
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="Enter username"
                                    defaultValue={formData.username}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" required>
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    defaultValue={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="memo">
                                Memo <span className="text-xs text-gray-500">(Optional)</span>
                            </Label>
                            <Textarea
                                id="memo"
                                name="memo"
                                placeholder="Add notes about this admin account"
                                defaultValue={formData.memo}
                                onChange={handleChange}
                                rows={3}
                                hint="The password will be automatically generated by the system and sent to the admin's email"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={formData.is_master}
                                    onChange={handleCheckboxChange("is_master")}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Is Master Admin
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={formData.is_enable}
                                    onChange={handleCheckboxChange("is_enable")}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Is Enabled
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating..." : "Create Admin"}
                            </button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
} 