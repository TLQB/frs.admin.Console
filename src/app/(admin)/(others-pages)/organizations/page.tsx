"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Organizations from "@/components/organizations/organizations";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";

export default function OrganizationsPage() {
    const router = useRouter();
    const { userInfo, isLoading } = useAuthContext();

    // Redirect if not master
    useEffect(() => {
        if (!isLoading && userInfo && !userInfo.isMaster) {
            // Redirect to dashboard if not master
            router.push("/");
        }
    }, [userInfo, isLoading, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="p-4 text-center text-gray-500">
                Loading...
            </div>
        );
    }

    // Show error if not master
    if (!userInfo?.isMaster) {
        return (
            <div className="p-4 text-center text-red-500">
                You don't have permission to view this page. Only master users can access organizations.
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Organizations" />

            <div className="space-y-6">
                <ComponentCard title="List Organizations">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div>
                            <Link href="/organizations/create">
                                <Button
                                    size="sm"
                                    variant="primary"
                                    startIcon={<PlusIcon />}
                                    className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
                                >
                                    Create Organization
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Organizations />
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}

