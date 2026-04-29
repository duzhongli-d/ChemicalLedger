"use client";

const navItems = [
  { href: "/admin/dashboard", label: "仪表板", icon: "📊" },
  { href: "/admin/users", label: "用户管理", icon: "👥" },
  { href: "/admin/categories", label: "品类配置", icon: "📁" },
  { href: "/admin/ledgers", label: "台账管理", icon: "📋" },
  { href: "/admin/audit-log", label: "审计日志", icon: "🔒" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-8">管理后台</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-3 rounded hover:bg-gray-800"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
