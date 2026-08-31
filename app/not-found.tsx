import { Logo } from "@/components/marketing";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Logo />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted">That route isn’t in the playbook.</p>
      <Link href="/" className="text-sm text-accent hover:underline">
        Back to NomadShield
      </Link>
    </div>
  );
}
