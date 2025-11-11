"use client";

import React, { useState } from "react";
import { useCurrentUserDataQuery, useUpdateProfileMutation } from "@/redux/services/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Eye, EyeClosed } from "lucide-react";

const AccountPage = () => {
  const { data: user, isLoading, isError } = useCurrentUserDataQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswords((prev) => ({ ...prev, [id]: value }));
  };

  const toggleVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill out all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      await updateProfile({
        oldPassword: currentPassword,
        password: newPassword,
      }).unwrap();

      toast.success("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update password.");
    }
  };

  if (isLoading) {
      return (
        <div className="flex flex-col w-full space-y-10 text-white">
          {/* Skeleton for Profile Section */}
          <section className="space-y-6">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
  
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {[...Array(4)].map((_, i) => (
                <div className="space-y-2" key={i}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </section>
  
          {/* Skeleton for Password Section */}
          <section className="space-y-6 border-t border-gray-800 pt-8">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
  
            <div className="space-y-4 max-w-md">
              {[...Array(3)].map((_, i) => (
                <div className="space-y-2" key={i}>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
              <Skeleton className="h-10 w-36 rounded-md mt-4" />
            </div>
          </section>
        </div>
      );
    }

  if (isError || !user) {
    return (
      <div className="flex items-center justify-center w-full py-10 text-red-500">
        Failed to load account information.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-10 text-white">
      {/* Profile Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p className="text-sm text-gray-400">
            Update your personal details here.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 rounded-lg">
            <AvatarImage
              src={user.photo?.url || "/placeholder-avatar.png"}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback className="rounded-lg text-gray-800 bg-gray-200">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              Change Photo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={user.firstName} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={user.lastName} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role?.name || "User"} readOnly />
          </div>
        </div>
      </section>

      {/* Update Password Section */}
      <section className="space-y-6 border-t border-gray-800 pt-8">
        <div>
          <h2 className="text-xl font-semibold">Update Password</h2>
          <p className="text-sm text-gray-400">
            Change your password to keep your account secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div className="space-y-2 relative">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword.currentPassword ? "text" : "password"}
                placeholder="••••••••"
                value={passwords.currentPassword}
                onChange={handleChange}
                className="bg-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("currentPassword")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              >
                {showPassword.currentPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2 relative">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword.newPassword ? "text" : "password"}
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={handleChange}
                className="bg-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("newPassword")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              >
                {showPassword.newPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword.confirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="bg-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("confirmPassword")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              >
                {showPassword.confirmPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="mt-4 w-full sm:w-auto" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default AccountPage;
