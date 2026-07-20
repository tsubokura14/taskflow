"use client"

import Link from "next/link"

export function TextLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="text-blue-700 hover:text-blue-800">
            {children}
        </Link>
    )
}