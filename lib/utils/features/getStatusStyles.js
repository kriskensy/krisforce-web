export function getStatusStyles(status, type) {
  const statusCode = status?.toLowerCase().replace(/\s+/g, '_');

  const styles = {
    order: {
      new: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400",
      confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400",
      processing: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400",
      shipped: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400",
    },
    invoice: {
      draft: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-500/10 dark:text-slate-400",
      issued: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400",
      sent: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
      overdue: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 animate-pulse font-bold",
      cancelled: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/5 dark:text-slate-500",
    },
    ticket: {
      new: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 font-semibold",
      in_progress: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400",
      waiting_for_customer: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400",
      resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
      closed: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-500/10 dark:text-slate-500",
    },
    ticketsPriority: {
      critical: "bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white font-black animate-bounce shadow-sm",
      high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 font-bold",
      normal: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400",
      low: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400",
    }
  };

  const currentTypeStyles = styles[type] || styles.order;
  return currentTypeStyles[statusCode] || "bg-slate-50 text-slate-600 border-slate-200";
}