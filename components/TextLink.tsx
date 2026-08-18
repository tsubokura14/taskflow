"use client"

import Link from "next/link"

export function TextLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
    return (
        <Link href={href} className={`text-blue-700 hover:text-blue-800 ${className ?? ""}`}>
            {children}
        </Link>
    )
}