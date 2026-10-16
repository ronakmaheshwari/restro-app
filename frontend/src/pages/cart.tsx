import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRightIcon, MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/custom/PageShell";
import { DishArt } from "@/components/custom/DishArt";
import { EmptyState } from "@/components/custom/EmptyState";
import { cardClass } from "@/components/custom/form";
import { menuService, orderService } from "@/api/api-service";
import type { OrderItemInput } from "@/api/types";

const STORAGE_KEY = "cart-items";

function loadCart(): OrderItemInput[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export const Cart = () => {
    const [items, setItems] = useState<OrderItemInput[]>(() => loadCart());
    const [notice, setNotice] = useState<string | null>(null);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const menuQuery = useQuery({
        queryKey: ["menu-for-cart"],
        queryFn: () => menuService.getMenu({ isDeleted: false, page: 1, limit: 100 }),
    });
    const dishById = new Map((menuQuery.data?.data ?? []).map((d) => [d.id, d]));

    const submitMutation = useMutation({
        mutationFn: () => orderService.addToCart({ orders: items }),
        onSuccess: (res) => {
            setNotice(res.message);
            if (res.success && res.data) {
                setLastOrderId(res.data.id);
                setItems([]);
            }
        },
        onError: () => setNotice("Failed to place the order."),
    });

    const total = items.reduce((sum, i) => sum + (dishById.get(i.menu_id)?.price ?? 0) * i.quantity, 0);

    const setQty = (menu_id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.menu_id !== menu_id));
        } else {
            setItems((prev) =>
                prev.some((i) => i.menu_id === menu_id)
                    ? prev.map((i) => (i.menu_id === menu_id ? { ...i, quantity: Math.min(50, quantity) } : i))
                    : [...prev, { menu_id, quantity: Math.min(50, quantity) }],
            );
        }
    };

    return (
        <PageShell
            eyebrow="Your table"
            title="Cart"
            description="Review your picks, adjust quantities, and send the order to the kitchen."
        >
            {notice && (
                <p className="mb-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-[13px] font-medium text-primary">
                    {notice}
                </p>
            )}
            {lastOrderId && (
                <p className="mb-4 rounded-xl border border-emerald-600/25 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-medium text-emerald-700">
                    Order placed — track it{" "}
                    <Link to={`/orders/${lastOrderId}`} className="font-mono font-bold underline underline-offset-2">
                        #{lastOrderId.slice(0, 8).toUpperCase()}
                    </Link>
                </p>
            )}

            {items.length === 0 ? (
                <EmptyState
                    title="Your cart is empty"
                    hint="Head to the menu and add something delicious."
                    action={
                        <Link to="/menu">
                            <Button>
                                Browse menu
                                <ArrowRightIcon className="size-4" />
                            </Button>
                        </Link>
                    }
                />
            ) : (
                <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                    <div className="flex flex-col gap-3">
                        {items.map((i) => {
                            const dish = dishById.get(i.menu_id);
                            return (
                                <div key={i.menu_id} className={`${cardClass} flex items-center gap-4 overflow-hidden p-3`}>
                                    <div className="w-24 shrink-0 overflow-hidden rounded-xl">
                                        <DishArt id={i.menu_id} name={dish?.name ?? "?"} size="sm" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-display text-base font-semibold">
                                            {dish?.name ?? `#${i.menu_id.slice(0, 8).toUpperCase()}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground tabular-nums">
                                            ₹{dish?.price ?? "…"} each
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex items-center rounded-full border border-border bg-background p-1">
                                                <button
                                                    aria-label="Decrease quantity"
                                                    onClick={() => setQty(i.menu_id, i.quantity - 1)}
                                                    className="flex size-6 items-center justify-center rounded-full hover:bg-muted"
                                                >
                                                    <MinusIcon className="size-3" weight="bold" />
                                                </button>
                                                <span className="w-6 text-center text-[13px] font-bold tabular-nums">{i.quantity}</span>
                                                <button
                                                    aria-label="Increase quantity"
                                                    onClick={() => setQty(i.menu_id, i.quantity + 1)}
                                                    className="flex size-6 items-center justify-center rounded-full hover:bg-muted"
                                                >
                                                    <PlusIcon className="size-3" weight="bold" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setQty(i.menu_id, 0)}
                                                className="flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                                            >
                                                <TrashIcon className="size-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <p className="shrink-0 pr-2 font-display text-lg font-semibold tabular-nums">
                                        ₹{(dish?.price ?? 0) * i.quantity}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <aside className={`${cardClass} h-fit p-6 lg:sticky lg:top-24`}>
                        <h2 className="font-display text-lg font-semibold">Order summary</h2>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <dt>Items</dt>
                                <dd className="font-semibold text-foreground tabular-nums">{items.reduce((n, i) => n + i.quantity, 0)}</dd>
                            </div>
                            <div className="flex justify-between border-t border-border pt-3">
                                <dt className="font-semibold">Total</dt>
                                <dd className="font-display text-2xl font-semibold tabular-nums">₹{total}</dd>
                            </div>
                        </dl>
                        <Button
                            className="mt-5 w-full"
                            size="lg"
                            disabled={submitMutation.isPending}
                            onClick={() => submitMutation.mutate()}
                        >
                            <ShoppingCartIcon className="size-4" weight="bold" />
                            {submitMutation.isPending ? "Sending…" : "Send to kitchen"}
                        </Button>
                        <Button variant="ghost" className="mt-2 w-full" onClick={() => setItems([])}>
                            Clear cart
                        </Button>
                        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
                            Payment happens at checkout — this sends the order to the kitchen.
                        </p>
                    </aside>
                </div>
            )}
        </PageShell>
    );
};
