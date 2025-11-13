"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { SignInSchema } from "@/schemas/sign-in-schema";

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
import { useLoginMutation } from "@/redux/services/auth";
import { toast } from "sonner";
import { ADMIN_AUTH_TOKEN, AUTH_TOKEN } from "@/contracts/reduxResourceTags";
import { setAuthCookie } from "@/actions/action";

type SignInFormType = z.infer<typeof SignInSchema>;

export function SignInForm() {
  const router = useRouter();
  const [login] = useLoginMutation();

  const form = useForm<SignInFormType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: SignInFormType) {
    await login(data)
      .unwrap()
      .then((response) => {
        toast.success(response?.data?.message || "Login successful!");
        const token = response?.token;
        const role = response?.user?.role?.name;

        if (role === "User") {
          setAuthCookie(AUTH_TOKEN, token, 30);
          router.push("/");
        }
        if (role === "Admin") {
          setAuthCookie(ADMIN_AUTH_TOKEN, token, 30);
          router.push("/admin/users");
        }
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Login failed.");
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-auto"
      >
        {/* Inputs */}
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200 font-medium">Email</FormLabel>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200 font-medium">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400 rounded-md focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-start -mt-1">
          <button
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            className="text-sm text-pink-500 hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full cursor-pointer h-12 px-6 md:px-8 text-white shadow-lg text-sm md:text-base flex items-center justify-center mt-1"
          style={{
            backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            boxShadow: "0 4px 12px rgba(205,1,186,0.5), 0 4px 12px rgba(226,3,23,0.5)",
          }}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        {/* Bottom CTA */}
        <div className="text-center text-gray-400 text-sm w-full mx-auto">
          Not a member?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-pink-500 font-medium hover:underline cursor-pointer"
          >
            Sign Up now
          </button>
        </div>
        
      </form>
    </Form>
  );
}
