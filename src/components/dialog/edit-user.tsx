"use client";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateUserMutation } from "@/redux/services/user";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";

interface UserUpdateBody {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: { id: number };
  status: { id: number };
}

interface UpdateUserArgs {
  id: string;
  body: UserUpdateBody;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: { id: number; name: string };
  status: string;
}

interface EditUserDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  user?: UserData;
  onOpenChange: (open: boolean) => void;
}

const EditUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  isAdmin: z.boolean(),
  isActive: z.boolean(),
});

type EditUserType = z.infer<typeof EditUserSchema>;

export function EditUserDialog({ user, onOpenChange, ...props }: EditUserDialogProps) {
  const [updateUser, { isLoading, error }] = useUpdateUserMutation();
  const initialIsActive = user?.status?.toLowerCase() === "active";
  const initialIsAdmin = user?.role?.id === 1;
  const form = useForm<EditUserType>({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      password: "",
      isAdmin: initialIsAdmin,
      isActive: initialIsActive,
    },
  });

  async function onSubmit(values: EditUserType) {
    if (!user?.id) return;
    const finalRoleId = values.isAdmin ? 1 : 2;
    const finalStatusId = values.isActive ? 1 : 2;
    const updatePayload: UpdateUserArgs = {
      id: user.id,
      body: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password ?? "",
        role: { id: finalRoleId },
        status: { id: finalStatusId },
      },
    };
    try {
      await updateUser(updatePayload).unwrap();
      onOpenChange(false);
      toast.success("User Details Updated");
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    }
  }

  const buttonText = isLoading ? "Saving..." : "Save Changes";
  const statusDescription = form.watch("isActive") ? "Active (ID 1)" : "Inactive (ID 2)";
  const roleDescription = form.watch("isAdmin") ? "Admin (ID 1)" : "User (ID 2)";

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User: {user?.firstName} {user?.lastName}</DialogTitle>
          <DialogDescription>Update user details below.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <div className="grid gap-2">
              <FormLabel>Photo</FormLabel>
              <label htmlFor="photo-upload" className={`relative flex items-center justify-center h-20 w-full border-2 border-dashed rounded-md cursor-pointer transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-primary/80"}`}>
                <ImagePlus className="absolute top-2 left-2 h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload photo (File input is hidden)</span>
                <Input id="photo-upload" type="file" accept="image/*" disabled={isLoading} onChange={() => {}} className="sr-only" />
              </label>
            </div>

            <FormField control={form.control} name="isAdmin" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Role</FormLabel>
                  <DialogDescription>{roleDescription}</DialogDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} /></FormControl>
              </FormItem>
            )}/>

            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Status</FormLabel>
                  <DialogDescription>{statusDescription}</DialogDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} /></FormControl>
              </FormItem>
            )}/>

            <DialogFooter className="gap-2 mt-4">
              <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" className="w-fit" disabled={isLoading}>{buttonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserDialog;
