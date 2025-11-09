import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="rounded-lg shadow bg-white p-6">
        <SignUp />
      </div>
    </div>
  );
}
