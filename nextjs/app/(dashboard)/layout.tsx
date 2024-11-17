import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 max-h-screen p-4 sm:p-6 md:p-8 lg:p-6 pt-16 lg:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
