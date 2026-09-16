import NavBar from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <NavBar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
