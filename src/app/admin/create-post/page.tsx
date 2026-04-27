import type { Metadata } from "next";
import { AdminCreatePostForm } from "@/components/admin/AdminCreatePostForm";

export const metadata: Metadata = { title: "Admin — Crea Post" };

export default function AdminCreatePostPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-white">Crea Post</h1>
      <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
        <AdminCreatePostForm />
      </div>
    </div>
  );
}
