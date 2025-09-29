export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo/Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">DPW</h1>
          <p className="text-lg text-gray-600">Micro-Tasking Platform</p>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Project Foundation Setup
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Next.js 14 with App Router ✓</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">TypeScript & Tailwind CSS ✓</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Prisma ORM & PostgreSQL ✓</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Inter Font & Design System ✓</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Project Structure & Utils ✓</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold text-secondary mb-2">Next Steps</h3>
          <p className="text-sm text-gray-600">
            Ready for Phase 2: Database Schema & Docker Setup
          </p>
        </div>

        {/* Development Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Mobile-first • Minimalist Design • Inter Font</p>
          <p>Colors: White • Black (#1D1D1F) • Red (#EF4444)</p>
        </div>
      </div>
    </div>
  );
}
