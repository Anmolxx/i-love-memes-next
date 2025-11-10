import { Noto_Serif } from "next/font/google";
import { AuthHeader, AuthTitle, AuthDescription } from "../layout";
import { SignInForm } from "@/components/auth/sign-in-form";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 p-4 -mt-8">
      <AuthHeader>
        <AuthTitle>
          <span
            className={`${notoSerif.className} bg-clip-text text-transparent`}
            style={{
              backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            }}
          >
            Sign{" "}
          </span>
          in
        </AuthTitle>
        <AuthDescription className="text-gray-300">
          Enter your email below to sign in to your account
        </AuthDescription>
      </AuthHeader>

      <div className="w-full max-w-md mt-6">
        <SignInForm />
      </div>
    </div>
  );
}
