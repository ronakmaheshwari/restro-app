import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CaretRightIcon, ReceiptIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/custom/PageShell";
import { StatusPill } from "@/components/custom/StatusPill";
import { EmptyState } from "@/components/custom/EmptyState";
import { cardClass, filterBarClass, inputClass } from "@/components/custom/form";
import { orderService } from "@/api/api-service";
import type { BillStatus, OrderStatus } from "@/api/types";

export const Orders = () => {
    const [userName, setUserName] = useState("");
    const [billStatus, setBillStatus] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState<"user_name" | "price" | "total" | "quantity" | "created_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const limit = 10;

    const ordersQuery = useQuery({
        queryKey: ["orders", userName, billStatus, status, sortBy, sortOrder, page],
        queryFn: () =>
            orderService.getOrders({
                total: null,
                user_name: userName || null,
                bill_status: (billStatus || null) as BillStatus | null,
                status: (status || null) as OrderStatus | null,
                user_id: null,
                sortBy,
                sortOrder,
                limit,
                page,
            }),
    });

    const orders = ordersQuery.data?.data ?? [];

    return (
        <PageShell
            wide
            eyebrow="Kitchen pass"
            title="Orders"
            description="Every order, filterable by guest, status and bill — newest first."
        >
            <div className={filterBarClass}>
                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
                    <input className={inputClass} placeholder="Guest name…" value={userName} onChange={(e) => { setUserName(e.target.value); setPage(1); }} />
                    <select className={inputClass} value={billStatus} onChange={(e) => { setBillStatus(e.target.value); setPage(1); }}>
                        <option value="">Bill: all</option>
                        <option value="PAID">Paid</option>
                        <option value="UNPAID">Unpaid</option>
                    </select>
                    <select className={inputClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                        <option value="">Status: all</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <select
                        className={inputClass}
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => { const [sb, so] = e.target.value.split("-"); setSortBy(sb as typeof sortBy); setSortOrder(so as "asc" | "desc"); }}
                    >
                        <option value="created_at-desc">Newest first</option>
                        <option value="created_at-asc">Oldest first</option>
                        <option value="total-desc">Highest bill</option>
                        <option value="total-asc">Lowest bill</option>
                        <option value="user_name-asc">Guest · A–Z</option>
                    </select>
                    <Button variant="ghost" onClick={() => { setUserName(""); setBillStatus(""); setStatus(""); setPage(1); }}>
                        Clear filters
                    </Button>
                </div>
            </div>

            {ordersQuery.data && !ordersQuery.data.success && (
                <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-[13px] font-medium text-destructive">
                    {ordersQuery.data.message}
                </p>
            )}

            {ordersQuery.isLoading ? (
                <div className="mt-4 flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`${cardClass} h-20 animate-pulse bg-muted/40`} />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="mt-4">
                    <EmptyState title="No orders yet" hint="Orders placed from the menu will appear here." />
                </div>
            ) : (
                <div className="mt-4 flex flex-col gap-3">
                    {orders.map((o) => (
                        <Link
                            key={o.id}
                            to={`/orders/${o.id}`}
                            className={`${cardClass} group flex items-center gap-4 p-4 transition-all hover:-translate-y-px hover:shadow-md sm:p-5`}
                        >
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ReceiptIcon className="size-5" weight="bold" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-mono text-[13px] font-semibold">
                                    #{o.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span className="mt-1 flex flex-wrap gap-1.5">
                                    <StatusPill value={o.status} />
                                    <StatusPill value={o.bill_status} />
                                </span>
                            </span>
                            <span className="text-right">
                                <span className="block font-display text-xl font-semibold tabular-nums">₹{o.total_amount}</span>
                                <span className="mt-0.5 flex items-center justify-end gap-0.5 text-xs font-semibold text-primary">
                                    View
                                    <CaretRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" weight="bold" />
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                </Button>
                <span className="text-[13px] font-semibold tabular-nums">Page {page}</span>
                <Button variant="outline" disabled={orders.length < limit} onClick={() => setPage((p) => p + 1)}>
                    Next
                </Button>
            </div>
        </PageShell>
    );
};
