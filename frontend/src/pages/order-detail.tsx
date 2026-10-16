import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon, ReceiptIcon, XCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/custom/PageShell";
import { StatusPill } from "@/components/custom/StatusPill";
import { cardClass } from "@/components/custom/form";
import { orderService } from "@/api/api-service";

export const OrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const queryClient = useQueryClient();
    const [notice, setNotice] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => orderService.getOrderById(orderId ?? ""),
        enabled: Boolean(orderId),
    });

    const completeMutation = useMutation({
        mutationFn: () => orderService.completeOrder(orderId ?? ""),
        onSuccess: (res) => {
            setNotice(res.message);
            if (res.success) queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: () => orderService.cancelOrder(orderId ?? ""),
        onSuccess: (res) => {
            setNotice(res.message);
            if (res.success) queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        },
    });

    const order = detailQuery.data?.data;

    return (
        <PageShell
            eyebrow="Order"
            title={order ? `#${order.id.slice(0, 8).toUpperCase()}` : "Order detail"}
            description={order ? `Placed ${order.created_at ?? "recently"} · ${order.items.length} item${order.items.length === 1 ? "" : "s"}` : undefined}
            actions={
                <Link to="/orders">
                    <Button variant="outline" size="sm">
                        <ArrowLeftIcon className="size-4" />
                        All orders
                    </Button>
                </Link>
            }
        >
            {detailQuery.isLoading && (
                <div className={`${cardClass} animate-pulse p-6`}>
                    <div className="h-5 w-1/3 rounded bg-muted" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
                    <div className="mt-6 space-y-2">
                        <div className="h-12 rounded-xl bg-muted" />
                        <div className="h-12 rounded-xl bg-muted" />
                    </div>
                </div>
            )}
            {detailQuery.data && !detailQuery.data.success && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                    {detailQuery.data.message}
                </p>
            )}
            {notice && (
                <p className="mb-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-[13px] font-medium text-primary">
                    {notice}
                </p>
            )}

            {order && (
                <div className="flex flex-col gap-4">
                    <div className={`${cardClass} flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6`}>
                        <div className="flex items-center gap-3">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ReceiptIcon className="size-6" weight="bold" />
                            </span>
                            <div>
                                <p className="font-display text-3xl font-semibold tabular-nums">₹{order.total_amount}</p>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    <StatusPill value={order.status} />
                                    <StatusPill value={order.bill_status} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                disabled={completeMutation.isPending || order.status === "COMPLETED"}
                                onClick={() => completeMutation.mutate()}
                            >
                                <CheckCircleIcon className="size-4" weight="bold" />
                                {completeMutation.isPending ? "Completing…" : "Mark completed"}
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={cancelMutation.isPending || order.status === "CANCELLED"}
                                onClick={() => {
                                    if (window.confirm("Cancel this order?")) cancelMutation.mutate();
                                }}
                            >
                                <XCircleIcon className="size-4" weight="bold" />
                                {cancelMutation.isPending ? "Cancelling…" : "Cancel"}
                            </Button>
                        </div>
                    </div>

                    <div className={`${cardClass} p-5 sm:p-6`}>
                        <h2 className="font-display text-lg font-semibold">
                            Items · {order.items.length}
                        </h2>
                        <ul className="mt-3 divide-y divide-border/70">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                                    <div>
                                        <p className="font-mono text-[13px] font-semibold">
                                            #{item.menu_id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Qty {item.quantity} · ₹{item.price} each
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold tabular-nums">
                                        ₹{item.price * item.quantity}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
                            <span className="text-sm font-semibold">Total</span>
                            <span className="font-display text-xl font-semibold tabular-nums">₹{order.total_amount}</span>
                        </div>
                        <p className="mt-3 rounded-xl bg-muted/60 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
                            Payment is handled on the checkout page (not built yet) — it will call <span className="font-mono font-semibold">payOrder()</span>.
                        </p>
                    </div>
                </div>
            )}
        </PageShell>
    );
};
