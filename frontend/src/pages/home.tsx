import { Link } from "react-router-dom";
import {
    ArrowRightIcon,
    CalendarCheckIcon,
    ChefHatIcon,
    ClipboardTextIcon,
    ShoppingCartIcon,
    StarIcon,
} from "@phosphor-icons/react";
import { Navbar } from "@/components/custom/Navbar";
import { Footer } from "@/components/custom/Footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

const features = [
    {
        icon: ChefHatIcon,
        title: "Seasonal menu",
        text: "Dishes built around what's fresh, priced honestly, updated by our chefs daily.",
    },
    {
        icon: ShoppingCartIcon,
        title: "Effortless ordering",
        text: "Build your cart from the menu and place an order in seconds — no waiting to be seated.",
    },
    {
        icon: ClipboardTextIcon,
        title: "Live order tracking",
        text: "Follow every order from pending to served, with a clear bill status throughout.",
    },
];

const steps = [
    { n: "01", title: "Browse the menu", text: "Search, filter and sort dishes by craving or budget." },
    { n: "02", title: "Add to cart", text: "Pick quantities and place your order in one tap." },
    { n: "03", title: "Track & enjoy", text: "Watch your order move to completed, then settle the bill." },
];

export const Home = () => {
    const token = useAuthStore((s) => s.token);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(60% 50% at 80% 10%, oklch(0.55 0.16 45 / 12%), transparent 70%), radial-gradient(50% 40% at 10% 90%, oklch(0.82 0.12 78 / 25%), transparent 70%)",
                        }}
                    />
                    <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
                        <div>
                            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-primary uppercase shadow-xs">
                                <StarIcon className="size-3.5" weight="fill" />
                                The neighbourhood kitchen
                            </p>
                            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
                                Dinner, minus the wait.
                            </h1>
                            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                                Browse a chef-driven menu, order from your table
                                or sofa, and track every plate as it moves
                                through the kitchen.
                            </p>
                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                {token ? (
                                    <>
                                        <Link to="/menu">
                                            <Button size="lg">
                                                Browse the menu
                                                <ArrowRightIcon className="size-4" />
                                            </Button>
                                        </Link>
                                        <Link to="/orders">
                                            <Button size="lg" variant="outline">
                                                <CalendarCheckIcon className="size-4" />
                                                Track orders
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/signup">
                                            <Button size="lg">
                                                Get started
                                                <ArrowRightIcon className="size-4" />
                                            </Button>
                                        </Link>
                                        <Link to="/login">
                                            <Button size="lg" variant="outline">Log in</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                            <dl className="mt-9 flex gap-8">
                                {[
                                    ["120+", "Dishes served daily"],
                                    ["15 min", "Avg. kitchen time"],
                                    ["4.9", "Guest rating"],
                                ].map(([v, l]) => (
                                    <div key={l}>
                                        <dt className="sr-only">{l}</dt>
                                        <dd className="font-display text-2xl font-semibold">{v}</dd>
                                        <dd className="mt-0.5 text-xs text-muted-foreground">{l}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                        <div className="relative">
                            <div className="overflow-hidden rounded-[2rem] border border-border/70 shadow-xl shadow-primary/10">
                                <img
                                    src="/restro.png"
                                    alt="Signature dishes at Restro"
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
                                    <ChefHatIcon className="size-5" weight="bold" />
                                </span>
                                <span>
                                    <span className="block text-sm font-bold">Kitchen is open</span>
                                    <span className="block text-xs text-muted-foreground">Mon – Sun · till late</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                    <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">Why Restro</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
                        Built around the table
                    </h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {features.map((f) => (
                            <div key={f.title} className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-shadow hover:shadow-md">
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <f.icon className="size-5" weight="bold" />
                                </span>
                                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="border-y border-border/60 bg-card/50">
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                        <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">How it works</p>
                        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
                            Three steps to the table
                        </h2>
                        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
                            {steps.map((s) => (
                                <li key={s.n} className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
                                    <span className="font-display text-3xl font-semibold text-primary/70">{s.n}</span>
                                    <h3 className="mt-2 font-semibold">{s.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                    <div className="relative overflow-hidden rounded-[2rem] bg-stone-900 px-6 py-12 text-center sm:px-12">
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(50% 80% at 50% 120%, oklch(0.55 0.16 45 / 55%), transparent 70%)",
                            }}
                        />
                        <h2 className="relative font-display text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl">
                            Hungry? The kitchen is already warm.
                        </h2>
                        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-400">
                            Create an account to order, book ahead, and keep
                            every bill in one place.
                        </p>
                        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
                            {token ? (
                                <Link to="/menu">
                                    <Button size="lg">
                                        Order now
                                        <ArrowRightIcon className="size-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/signup">
                                        <Button size="lg">
                                            Create free account
                                            <ArrowRightIcon className="size-4" />
                                        </Button>
                                    </Link>
                                    <Link to="/menu">
                                        <Button size="lg" variant="secondary">Peek at the menu</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};
