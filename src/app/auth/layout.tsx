import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="h-screen w-full flex items-center justify-center bg-gray-950 p-6 overflow-hidden">
      <div className="w-full max-w-md bg-gray-950 shadow-lg rounded-xl p-8 space-y-6">
        {children}
      </div>
    </section>
  );
}

export function AuthHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("space-y-2 text-center", className)} {...props} />;
}

export function AuthTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-3xl md:text-4xl font-bold leading-tight tracking-tight text-gray-100",
        className
      )}
      {...props}
    />
  );
}

export function AuthDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm text-gray-400", className)} {...props} />;
}
