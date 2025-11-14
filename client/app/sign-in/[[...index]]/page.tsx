import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-card">
      <div className="rounded-lg shadow bg-white p-3">
        <SignIn />
      </div>
    </div>
  );
}
