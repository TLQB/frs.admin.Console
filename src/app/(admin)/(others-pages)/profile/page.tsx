"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { getMyEmployeeProfile, updateMyEmployeeProfile } from "@/services/api/employees";
import Image from "next/image";

export default function ProfilePage() {
    const { userInfo, refreshUserInfo } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const profile = await getMyEmployeeProfile();
                setFormData({
                    name: profile.full_name || userInfo?.name || "",
                    email: profile.email || userInfo?.email || "",
                });
                // Set avatar preview if photo exists
                if (profile.photo) {
                    setAvatarPreview(profile.photo);
                } else if (profile.avatar) {
                    setAvatarPreview(profile.avatar);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                // Fallback to userInfo from context
                setFormData({
                    name: userInfo?.name || "",
                    email: userInfo?.email || "",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please select an image file");
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }
            setAvatarFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            const updateData: any = {
                full_name: formData.name,
                email: formData.email,
};

            if (avatarFile) {
                updateData.avatar = avatarFile;
            }

            await updateMyEmployeeProfile(updateData);
            
            // Refresh user info to update navbar
            refreshUserInfo();
            
            setSuccess("Profile updated successfully!");
            setAvatarFile(null);
        } catch (err: any) {
            console.error("Error updating profile:", err);
            let errorMessage = "Failed to update profile. Please try again.";
            if (err?.response?.data) {
                const data = err.response.data;
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (typeof data === 'object') {
                    const firstError = Object.values(data)[0];
                    if (Array.isArray(firstError)) {
                        errorMessage = firstError[0] as string;
                    } else if (typeof firstError === 'string') {
                        errorMessage = firstError;
                    }
                }
            }
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
  return (
    <div>
                <PageBreadcrumb pageTitle="Profile" />
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Profile" />

            <div className="space-y-6">
                <ComponentCard title="Edit Profile">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-green-50 text-green-500 rounded-md text-sm">
                                {success}
                            </div>
                        )}

                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-32 h-32 overflow-hidden rounded-full border-4 border-gray-200 dark:border-gray-700">
                                    {avatarPreview ? (
                                        <Image
                                            src={avatarPreview}
                                            alt="Avatar"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <svg
                                                className="w-16 h-16 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Click the camera icon to upload a new avatar
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name" required>
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" required>
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="submit"
                                size="sm"
                                variant="primary"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
        </div>
                    </form>
                </ComponentCard>
      </div>
    </div>
  );
}
