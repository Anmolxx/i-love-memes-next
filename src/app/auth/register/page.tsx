import { Noto_Serif } from "next/font/google";
import { AuthHeader, AuthTitle, AuthDescription } from "../layout";
import { RegisterForm } from "@/components/auth/register-form";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

export default function RegisterPage() {
  return (
    <>
      <AuthHeader>
        <AuthTitle>
          <span
            className={`${notoSerif.className} bg-clip-text text-transparent`}
            style={{
              backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            }}
          >
            Create{" "}
          </span>
          Account
        </AuthTitle>
        <AuthDescription>
          Enter your information below to create your account
        </AuthDescription>
      </AuthHeader>
      <div>
        <RegisterForm />
      </div>
    </>
  );
}
