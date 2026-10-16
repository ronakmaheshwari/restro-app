import { Link } from "react-router-dom";
import { ForkKnifeIcon, QuotesIcon } from "@phosphor-icons/react";
import { AuthCard } from "@/components/custom/Auth";

export const Login = () => {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[1.1fr_1fr]">
            <div className="flex items-center justify-center px-4 py-10 sm:px-8">
                <AuthCard type="login" />
            </div>

            <div className="relative hidden overflow-hidden lg:block">
                <img
                    src="/restro.png"
                    alt="Signature dishes at Restro"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-stone-950/10" />
                <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 p-8">
                    <Link to="/home" className="flex items-center gap-2.5">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                            <ForkKnifeIcon className="size-5" weight="bold" />
                        </span>
                        <span className="font-display text-xl font-semibold text-white">Restro</span>
                    </Link>
                </div>
                <figure className="absolute inset-x-0 bottom-0 p-8">
                    <QuotesIcon className="size-7 text-white/60" weight="fill" />
                    <blockquote className="mt-2 max-w-md font-display text-2xl leading-snug font-medium text-white text-balance">
                        Your table is waiting — and so is your usual.
                    </blockquote>
                    <figcaption className="mt-3 text-sm text-white/70">
                        Log in to order in seconds
                    </figcaption>
                </figure>
            </div>
        </div>
    );
};
