"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { getDetailTenant, updateTenant, Tenant } from "@/services/api/organizations";

export default function OrganizationDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tenantId = Number(params?.id);

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [name, setName] = useState("");
    const [schemaName, setSchemaName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getDetailTenant(tenantId);
                setTenant(data);
                setName(data?.name || "");
                setSchemaName(data?.schema_name || "");
            } catch (err) {
                console.error("Failed to fetch tenant detail", err);
                setError("Failed to load organization.");
            } finally {
                setLoading(false);
            }
        };
        if (!isNaN(tenantId)) load();
    }, [tenantId]);

    const handleSave = async () => {
        if (!tenant) return;
        try {
            setSaving(true);
            await updateTenant(tenant.id, { name });
            router.push("/organizations");
        } catch (err) {
            console.error("Failed to update tenant", err);
            setError("Update failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle={`Organization #${tenantId}`} />
            <div className="space-y-6">
                <ComponentCard title="Edit Organization">
                    {loading ? (
                        <div className="p-4 text-gray-500">Loading...</div>
                    ) : error ? (
                        <div className="p-4 text-red-500">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Organization name" />
                            </div>
                            <div>
                                <Label htmlFor="schema">Schema Name</Label>
                                <Input id="schema" name="schema" value={schemaName} disabled />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => router.push("/organizations")}>Cancel</Button>
                                <Button variant="primary" onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
                            </div>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </div>
    );
}


