"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api-client";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list().then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications.filter((n: { is_read: boolean }) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{tCommon("loading")}</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{tCommon("noData")}</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n: {
              id: string;
              type: string;
              title: string;
              content: string;
              ledger_id: string | null;
              is_read: boolean;
              sent_at: string;
            }) => (
              <li
                key={n.id}
                className={clsx(
                  "p-4 hover:bg-gray-50 transition-colors",
                  !n.is_read && "bg-blue-50/50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "inline-block w-2 h-2 rounded-full",
                        n.is_read ? "bg-gray-300" : "bg-blue-500"
                      )} />
                      <span className="text-sm font-medium text-gray-900">{n.title}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{n.content}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(n.sent_at).toLocaleString("zh-CN")}
                      </span>
                      {n.ledger_id && (
                        <Link
                          href={`/ledger/${n.ledger_id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          查看台账
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      disabled={markReadMutation.isPending}
                      className="text-xs text-gray-500 hover:text-blue-600 disabled:opacity-50"
                    >
                      {t("markRead")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}