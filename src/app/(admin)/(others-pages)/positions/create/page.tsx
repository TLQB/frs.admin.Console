"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Textarea from "@/components/form/Textarea";
import { createPosition, Position } from "@/services/api/employees";
import { getListDepartments, Department } from "@/services/api/departments";
import { extractItems } from "@/services/api/utils";
import { useAuthContext } from "@/context/AuthContext";

export default function CreatePositionPage() {
    const router = useRouter();
    const { userInfo, isLoading } = useAuthContext();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState<Partial<Position>>({
        name: "",
        level: undefined,
        department: undefined,
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!userInfo?.isOrgAdmin && !userInfo?.isMaster) return;

        const fetchDepartments = async () => {
            try {
                const response = await getListDepartments();
                const items = extractItems<Department>(response as any);
                setDepartments(items);
            } catch (err) {
                console.error("Error fetching departments:", err);
            }
        };
        fetchDepartments();
    }, [userInfo, isLoading]);

    if (!isLoading && (!userInfo?.isOrgAdmin && !userInfo?.isMaster)) {
        return (
            <div className="p-4 text-center text-red-500">
                Only org admin can create positions.
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'department' || name === 'level' ? (value ? parseInt(value) : undefined) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!formData.name) {
            setError("Position name is required");
            setIsSubmitting(false);
            return;
        }

        try {
            await createPosition(formData);
            router.push("/positions");
        } catch (err: any) {
            console.error("Error creating position:", err);
            let errorMessage = "Failed to create position. Please try again.";
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

    return (
        <div>
            <PageBreadcrumb pageTitle="Create Position" />

            <div className="max-w-3xl mx-auto">
                <ComponentCard title="Add New Position">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name" required>
                                    Position Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter position name"
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="level">
                                    Level
                                </Label>
                                <Input
                                    id="level"
                                    name="level"
                                    type="number"
                                    placeholder="Enter position level"
                                    value={formData.level || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="department">
                                Department
                            </Label>
                            <select
                                id="department"
                                name="department"
                                value={formData.department || ""}
                                onChange={handleChange}
                                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="description">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter position description"
                                value={formData.description || ""}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating..." : "Create Position"}
                            </button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

