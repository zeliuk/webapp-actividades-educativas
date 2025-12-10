"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
    href: string;
    children: React.ReactNode;
}

export default function NavLinkMobile({ href, children }: Props) {
    const pathname = usePathname();
    const isActive = pathname === href;

    const activeClasses =
        "block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white";

    const inactiveClasses =
        "block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white";

    return (
        <Link href={href} className={isActive ? activeClasses : inactiveClasses}>
            {children}
        </Link>
    );
}
