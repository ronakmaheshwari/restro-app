import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    MagnifyingGlassIcon,
    MinusIcon,
    PencilSimpleIcon,
    PlusIcon,
    ShoppingCartIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PageShell } from "@/components/custom/PageShell";
import { DishArt } from "@/components/custom/DishArt";
import { StatusPill } from "@/components/custom/StatusPill";
import { EmptyState } from "@/components/custom/EmptyState";
import { cardClass, filterBarClass, inputClass, labelClass } from "@/components/custom/form";
import { menuService, orderService } from "@/api/api-service";
import type { AddDish, EditDish, MenuResponse } from "@/api/types";

function DishForm({
    initial,
    onSubmit,
    pending,
}: {
    initial?: { name?: string; description?: string; price?: number; status?: "ACTIVE" | "INACTIVE" | null };
    onSubmit: (data: AddDish | EditDish) => void;
    pending: boolean;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [price, setPrice] = useState(initial?.price?.toString() ?? "");
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
        (initial?.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
    );

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className={labelClass}>Dish name</label>
                <input className={inputClass} placeholder="e.g. Butter Chicken" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <label className={labelClass}>Description</label>
                <textarea
                    className="min-h-24 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-xs transition outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                    placeholder="Short, plain-text description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Price (₹)</label>
                    <input
                        className={inputClass}
                        type="number"
                        min={10}
                        max={100000}
                        placeholder="249"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Status</label>
                    <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
            <Button
                disabled={pending}
                onClick={() =>
                    onSubmit({ name, description, price: Number(price), status })
                }
            >
                {pending ? "Saving…" : "Save dish"}
            </Button>
        </div>
    );
}

export const Menu = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "price">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [notice, setNotice] = useState<string | null>(null);
    const limit = 9;

    const menuQuery = useQuery({
        queryKey: ["menu", name, minPrice, maxPrice, status, sortBy, sortOrder, page],
        queryFn: () =>
            menuService.getMenu({
                name: name || null,
                description: null,
                price: null,
                status: (status || null) as "ACTIVE" | "INACTIVE" | null,
                isDeleted: false,
                min_price: minPrice ? Number(minPrice) : null,
                max_price: maxPrice ? Number(maxPrice) : null,
                sortBy,
                sortOrder,
                page,
                limit,
            }),
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["menu"] });

    const addMutation = useMutation({
        mutationFn: (data: AddDish) => menuService.addDish(data),
        onSuccess: (res) => {
            setNotice(res.message);
            if (res.success) invalidate();
        },
    });
    const editMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: EditDish }) => menuService.editDish(id, data),
        onSuccess: (res) => {
            setNotice(res.message);
            if (res.success) invalidate();
        },
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => menuService.deleteDish(id),
        onSuccess: (res) => {
            setNotice(res.message);
            if (res.success) invalidate();
        },
    });
    const cartMutation = useMutation({
        mutationFn: (dish: MenuResponse) =>
            orderService.addToCart({
                orders: [{ menu_id: dish.id, quantity: quantities[dish.id] ?? 1 }],
            }),
        onSuccess: (res) => setNotice(res.message),
    });

    const dishes = menuQuery.data?.data ?? [];
    const qty = (id: string) => quantities[id] ?? 1;
    const setQty = (id: string, v: number) =>
        setQuantities((q) => ({ ...q, [id]: Math.min(50, Math.max(1, v)) }));

    return (
        <PageShell
            wide
            eyebrow="Our kitchen"
            title="The menu"
            description="Seasonal dishes, honest prices. Search, filter, and add to your cart."
            actions={
                <Dialog>
                    <DialogTrigger render={<Button><PlusIcon className="size-4" />Add dish</Button>} />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a dish</DialogTitle>
                        </DialogHeader>
                        <DishForm onSubmit={(d) => addMutation.mutate(d as AddDish)} pending={addMutation.isPending} />
                    </DialogContent>
                </Dialog>
            }
        >
            <div className={filterBarClass}>
                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr]">
                    <div className="relative col-span-2 lg:col-span-1">
                        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            className={`${inputClass} pl-10`}
                            placeholder="Search dishes…"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setPage(1); }}
                        />
                    </div>
                    <input className={inputClass} type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} />
                    <input className={inputClass} type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} />
                    <select className={inputClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                        <option value="">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <select className={inputClass} value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [sb, so] = e.target.value.split("-"); setSortBy(sb as "name" | "price"); setSortOrder(so as "asc" | "desc"); }}>
                        <option value="name-asc">Name · A–Z</option>
                        <option value="name-desc">Name · Z–A</option>
                        <option value="price-asc">Price · low first</option>
                        <option value="price-desc">Price · high first</option>
                    </select>
                    <Button
                        variant="ghost"
                        onClick={() => { setName(""); setMinPrice(""); setMaxPrice(""); setStatus(""); setPage(1); }}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {notice && (
                <p className="mt-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-[13px] font-medium text-primary">
                    {notice}
                </p>
            )}
            {menuQuery.data && !menuQuery.data.success && (
                <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-[13px] font-medium text-destructive">
                    {menuQuery.data.message}
                </p>
            )}

            {menuQuery.isLoading ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`${cardClass} animate-pulse overflow-hidden`}>
                            <div className="h-36 bg-muted" />
                            <div className="space-y-2 p-5">
                                <div className="h-4 w-2/3 rounded bg-muted" />
                                <div className="h-3 w-full rounded bg-muted" />
                                <div className="h-8 w-1/2 rounded-full bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : dishes.length === 0 ? (
                <div className="mt-5">
                    <EmptyState
                        title="No dishes found"
                        hint="Try widening your search — or add the dish you're craving."
                    />
                </div>
            ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {dishes.map((dish) => (
                        <article key={dish.id} className={`${cardClass} group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5`}>
                            <div className="relative">
                                <DishArt id={dish.id} name={dish.name} />
                                <div className="absolute top-3 left-3">
                                    <StatusPill value={dish.status} />
                                </div>
                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Dialog>
                                        <DialogTrigger
                                            render={
                                                <button aria-label="Edit dish" className="flex size-8 items-center justify-center rounded-full bg-white/95 text-stone-700 shadow hover:bg-white" />
                                            }
                                        >
                                            <PencilSimpleIcon className="size-4" />
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit dish</DialogTitle>
                                            </DialogHeader>
                                            <DishForm
                                                initial={dish}
                                                pending={editMutation.isPending}
                                                onSubmit={(d) => editMutation.mutate({ id: dish.id, data: d })}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <button
                                        aria-label="Delete dish"
                                        disabled={deleteMutation.isPending}
                                        onClick={() => {
                                            if (window.confirm(`Delete "${dish.name}"?`)) deleteMutation.mutate(dish.id);
                                        }}
                                        className="flex size-8 items-center justify-center rounded-full bg-white/95 text-destructive shadow hover:bg-white"
                                    >
                                        <TrashIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-display text-lg leading-snug font-semibold">{dish.name}</h2>
                                    <p className="shrink-0 font-display text-lg font-semibold text-primary">
                                        ₹{dish.price}
                                    </p>
                                </div>
                                <p className="mt-1 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-muted-foreground">
                                    {dish.description}
                                </p>
                                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-4">
                                    <div className="flex items-center rounded-full border border-border bg-background p-1">
                                        <button
                                            aria-label="Decrease quantity"
                                            onClick={() => setQty(dish.id, qty(dish.id) - 1)}
                                            className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
                                        >
                                            <MinusIcon className="size-3.5" weight="bold" />
                                        </button>
                                        <span className="w-7 text-center text-sm font-bold tabular-nums">{qty(dish.id)}</span>
                                        <button
                                            aria-label="Increase quantity"
                                            onClick={() => setQty(dish.id, qty(dish.id) + 1)}
                                            className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
                                        >
                                            <PlusIcon className="size-3.5" weight="bold" />
                                        </button>
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={cartMutation.isPending}
                                        onClick={() => cartMutation.mutate(dish)}
                                    >
                                        <ShoppingCartIcon className="size-4" weight="bold" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                </Button>
                <span className="text-[13px] font-semibold tabular-nums">Page {page}</span>
                <Button variant="outline" disabled={dishes.length < limit} onClick={() => setPage((p) => p + 1)}>
                    Next
                </Button>
            </div>
        </PageShell>
    );
};
