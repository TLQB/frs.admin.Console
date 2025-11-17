"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Textarea from "@/components/form/Textarea";
import { createLeave, CreateLeaveRequestData } from "@/services/api/leaves";

export default function CreateLeavePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<CreateLeaveRequestData>({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

        if (!formData.leave_type || !formData.start_date || !formData.end_date) {
            setError("Please fill in all required fields");
            setIsSubmitting(false);
            return;
        }

        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            setError("Start date must be before end date");
            setIsSubmitting(false);
            return;
        }

        try {
            await createLeave(formData);
            router.push("/leaves");
        } catch (err: any) {
            console.error("Error creating leave request:", err);
            let errorMessage = "Failed to create leave request. Please try again.";
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
            <PageBreadcrumb pageTitle="Request Leave" />

            <div className="max-w-3xl mx-auto">
                <ComponentCard title="New Leave Request">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="leave_type" required>
                                Leave Type
                            </Label>
                            <select
                                id="leave_type"
                                name="leave_type"
                                value={formData.leave_type}
                                onChange={handleChange}
                                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                required
                            >
                                <option value="">Select Leave Type</option>
                                <option value="annual">Annual Leave</option>
                                <option value="sick">Sick Leave</option>
                                <option value="personal">Personal Leave</option>
                                <option value="emergency">Emergency Leave</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="start_date" required>
                                    Start Date
                                </Label>
                                <Input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="end_date" required>
                                    End Date
                                </Label>
                                <Input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="reason">
                                Reason
                            </Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Enter reason for leave"
                                value={formData.reason || ""}
                                onChange={handleChange}
                                rows={4}
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
                                {isSubmitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

