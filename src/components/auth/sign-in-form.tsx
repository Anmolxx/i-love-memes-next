"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/"; // default redirect

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
          // Redirect to the original page if provided
          router.push(redirectPath);
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
        className="grid gap-6 bg-gray-900 p-8 rounded-xl shadow-lg"
      >
        <div className="grid gap-4">
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
                    className="bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400"
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
                <FormLabel className="text-gray-200">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full h-12 px-6 md:px-8 text-white shadow-md text-sm md:text-base flex items-center justify-center"
          style={{
            backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            boxShadow:
              "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
          }}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
