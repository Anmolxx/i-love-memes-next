"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { RegisterSchema } from "@/schemas/register-schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegisterMutation } from "@/redux/services/auth";
import { toast } from "sonner";

type RegisterFormType = z.infer<typeof RegisterSchema>;

interface IRegisterFormProps {
  variant?: "user" | "admin";
}

export function RegisterForm({ variant }: IRegisterFormProps) {
  const router = useRouter();
  const [register] = useRegisterMutation();

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: RegisterFormType) {
    await register(data)
      .unwrap()
      .then((response) => {
        toast.success(response?.data?.message || "Registration successful!");
        router.push("/auth/login");
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Registration failed.");
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-auto"
      >
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">First Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="John"
                    className="bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400 rounded-md focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Last Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Doe"
                    className="bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400 rounded-md focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
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
              <FormLabel className="text-gray-200">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400 rounded-md focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className="bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400 rounded-md focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full h-12 px-6 md:px-8 text-white shadow-lg text-sm md:text-base flex items-center justify-center cursor-pointer mt-2"
          style={{
            backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            boxShadow: "0 4px 12px rgba(205,1,186,0.5), 0 4px 12px rgba(226,3,23,0.5)",
          }}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        {/* Already a member CTA */}
        <div className="text-center text-gray-400 text-sm -mt-1">
          Already a member?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-pink-500 font-medium hover:underline cursor-pointer"
          >
            Log in
          </button>
        </div>
      </form>
    </Form>
  );
}
