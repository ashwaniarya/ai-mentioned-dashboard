"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DesignSystemBackLink() {
  return (
    <Link
      href="/"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
    >
      Back to dashboard
    </Link>
  )
}
