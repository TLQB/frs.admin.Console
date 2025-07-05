import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import Link from "next/link";
import Notifications from "@/components/notifications/notifications";

export const metadata: Metadata = {
    title: "Notifications | FRS Admin Dashboard",
    description: "Notification management page for the FRS Admin Dashboard",
};

export default function NotificationsPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Notifications" />

            <div className="space-y-6">
                <ComponentCard title="List Notifications">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div>
                            <Link href="/notifications/create">
                                <Button
                                    size="sm"
                                    variant="primary"
                                    startIcon={<PlusIcon />}
                                    className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
                                >
                                    Create Notification
                                </Button>
                            </Link>
                        </div>

                        <div className="relative w-full sm:w-auto min-w-[250px]">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M19 19L14.65 14.65"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>

                            <input
                                type="text"
                                placeholder="Search notifications..."
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 dark:text-white shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500 dark:focus:border-brand-600"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Notifications />
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}