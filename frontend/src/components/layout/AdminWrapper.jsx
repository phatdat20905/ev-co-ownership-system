import React from 'react';

// Lightweight admin wrapper to isolate admin layout from co-owner UI.
// This is intentionally minimal: it provides a DOM root and a CSS hook
// so admin-specific styles/layout can be applied without changing
// the wrapped component implementations. We'll expand this wrapper
// later to include nav/sidebar, breadcrumbs, and role-aware context.
export default function AdminWrapper({ children }) {
  return (
    <div className="admin-layout min-h-screen bg-gray-50 text-gray-900">
      {/* Optionally add admin header/sidebar here in future */}
      <main className="admin-content container mx-auto p-4">{children}</main>
    </div>
  );
}
