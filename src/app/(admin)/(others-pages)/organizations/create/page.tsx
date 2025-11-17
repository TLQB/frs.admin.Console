"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { provisionTenant, ProvisionTenantRequest } from "@/services/api/organizations";
import { useAuthContext } from "@/context/AuthContext";

export default function CreateOrganizationPage() {
    const router = useRouter();
    const { userInfo } = useAuthContext();
    const [formData, setFormData] = useState<ProvisionTenantRequest>({
        name: "",
        schema_name: "",
        domain: "",
        admin_name: "",
        admin_email: "",
        admin_password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!userInfo?.isMaster) {
        return (
            <div className="p-4 text-center text-red-500">
                Only master users can create organizations.
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Validation
        if (!formData.name || !formData.schema_name || !formData.domain || !formData.admin_name || !formData.admin_email) {
            setError("Please fill in all required fields");
            setIsSubmitting(false);
            return;
        }

        try {
            await provisionTenant(formData);
            router.push("/organizations");
        } catch (err: any) {
            console.error("Error creating organization:", err);
            let errorMessage = "Failed to create organization. Please try again.";
            if (err?.response?.data) {
                const data = err.response.data;
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.error) {
                    errorMessage = data.error;
                }
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Create Organization" />

            <div className="max-w-3xl mx-auto">
                <ComponentCard title="Provision New Organization">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="name" required>
                                Organization Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter organization name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="schema_name" required>
                                    Schema Name
                                </Label>
                                <Input
                                    id="schema_name"
                                    name="schema_name"
                                    placeholder="e.g., org1"
                                    value={formData.schema_name}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Lowercase, alphanumeric and underscores only
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="domain" required>
                                    Domain
                                </Label>
                                <Input
                                    id="domain"
                                    name="domain"
                                    placeholder="e.g., org1.localhost"
                                    value={formData.domain}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Domain for this organization
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h3 className="text-lg font-semibold mb-4">Organization Admin Account</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="admin_name" required>
                                    Admin Username
                                </Label>
                                <Input
                                    id="admin_name"
                                    name="admin_name"
                                    placeholder="Enter admin username"
                                    value={formData.admin_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="admin_email" required>
                                    Admin Email
                                </Label>
                                <Input
                                    id="admin_email"
                                    name="admin_email"
                                    type="email"
                                    placeholder="Enter admin email"
                                    value={formData.admin_email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="admin_password">
                                Admin Password (Optional)
                            </Label>
                            <Input
                                id="admin_password"
                                name="admin_password"
                                type="password"
                                placeholder="Leave empty to auto-generate"
                                value={formData.admin_password || ""}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                If left empty, a random password will be generated and sent via email
                            </p>
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
                                {isSubmitting ? "Creating..." : "Create Organization"}
                            </button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

