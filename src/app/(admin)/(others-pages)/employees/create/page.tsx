"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import { createEmployee, CreateEmployeeData } from "@/services/api/employees";
import { getListDepartments } from "@/services/api/departments";
import { getListPositions } from "@/services/api/employees";
import { Department } from "@/services/api/departments";
import { Position } from "@/services/api/employees";
import { useAuthContext } from "@/context/AuthContext";
import { extractItems } from "@/services/api/utils";

export default function CreateEmployeePage() {
    const router = useRouter();
    const { userInfo, isLoading } = useAuthContext();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [formData, setFormData] = useState<CreateEmployeeData>({
        user_id: 0,
        full_name: "",
        employee_code: "",
        email: "",
        phone: "",
        department: undefined,
        position: undefined,
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!userInfo?.isOrgAdmin && !userInfo?.isMaster) return;

        const fetchData = async () => {
            try {
                const [depts, pos] = await Promise.all([
                    getListDepartments(),
                    getListPositions(),
                ]);
                const deptItems = extractItems<Department>(depts as any);
                setDepartments(deptItems);
                setPositions(Array.isArray(pos) ? pos : []);
            } catch (err) {
                console.error("Error fetching departments/positions:", err);
            }
        };
        fetchData();
    }, [userInfo, isLoading]);

    if (!isLoading && (!userInfo?.isOrgAdmin && !userInfo?.isMaster)) {
        return (
            <div className="p-4 text-center text-red-500">
                Only org admin can create employees.
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'department' || name === 'position' ? parseInt(value) || undefined : value
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

        if (!formData.full_name) {
            setError("Full name is required");
            setIsSubmitting(false);
            return;
        }

        try {
            await createEmployee(formData);
            router.push("/employees");
        } catch (err: any) {
            console.error("Error creating employee:", err);
            let errorMessage = "Failed to create employee. Please try again.";
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
            <PageBreadcrumb pageTitle="Create Employee" />

            <div className="max-w-3xl mx-auto">
                <ComponentCard title="Add New Employee">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="full_name" required>
                                    Full Name
                                </Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    placeholder="Enter full name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="employee_code">
                                    Employee Code
                                </Label>
                                <Input
                                    id="employee_code"
                                    name="employee_code"
                                    placeholder="Enter employee code"
                                    value={formData.employee_code || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="email">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
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
                                <Label htmlFor="position">
                                    Position
                                </Label>
                                <select
                                    id="position"
                                    name="position"
                                    value={formData.position || ""}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                >
                                    <option value="">Select Position</option>
                                    {positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={formData.is_active ?? true}
                                onChange={handleCheckboxChange("is_active")}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Is Active
                            </span>
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
                                {isSubmitting ? "Creating..." : "Create Employee"}
                            </button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

