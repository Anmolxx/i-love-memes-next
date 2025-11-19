import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, ImagePlus } from "lucide-react"; // Imported ImagePlus
import { useAddUserMutation } from "@/redux/services/user";
import { RegisterSchema } from "@/schemas/register-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const FormSchema = RegisterSchema.extend({
  isAdmin: z.boolean(),
  isActive: z.boolean(),
  photoId: z.string().optional().nullable(), 
});

type RegisterFormType = z.infer<typeof FormSchema>;

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [addUser, isLoading] = useAddUserMutation();

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      isAdmin: false,
      isActive: true,
      photoId: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: RegisterFormType) {
    const finalRoleId = data.isAdmin ? 1 : 2;
  
    const finalStatusId = data.isActive ? 1 : 0; 

    const payload = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      photoId: data.photoId || null, 
      role: {
        id: finalRoleId,
      },
      status: {
        id: finalStatusId,
      },
    };

    await addUser(payload as any)
      .unwrap()
      .then((response) => {
        console.log("User added successful:", response);
        toast.success(response?.data?.message || "User added successful!");
        setOpen(false);
        form.reset();
      })
      .catch((err: any) => {
        const apiError = err?.data;
          if (apiError?.errors && typeof apiError.errors === "object") {
            Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
          } else if (apiError?.message) toast.error(apiError.message);
          else toast.error("Failed to update user");
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="space-x-1">
          <span>Add User</span> <UserPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>Create new client</DialogTitle>
          <DialogDescription>
            Add a new client to your account
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="John" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Doe" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Photo Upload/ID Field */}
              <div className="grid gap-2">
                  <FormLabel>Photo</FormLabel>
                  <label htmlFor="photo-upload" className={`relative flex items-center justify-center h-20 w-full border-2 border-dashed rounded-md cursor-pointer transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-primary/80"}`}>
                    <ImagePlus className="absolute top-2 left-2 h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload photo (File input is hidden)</span>
                    <Input id="photo-upload" type="file" accept="image/*" onChange={() => {}} className="sr-only" />
                  </label>
                </div>

              {/* Assign Role Switch */}
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 col-span-full sm:col-span-1">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Assign Role</FormLabel>
                      <DialogDescription>
                          {field.value ? "Admin (ID 1)" : "User (ID 2)"}
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Status Switch */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 col-span-full sm:col-span-1">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <DialogDescription>
                          {field.value ? "Active (ID 1)" : "Inactive (ID 0)"}
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:space-x-0">
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="w-fit cursor-pointer">
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}