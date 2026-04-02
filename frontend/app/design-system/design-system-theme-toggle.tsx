"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

function readInitialDark(): boolean {
  if (typeof document === "undefined") return false
  return document.documentElement.classList.contains("dark")
}

export function DesignSystemThemeToggle() {
  const [isDark, setIsDark] = useState(readInitialDark)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", next)
    setIsDark(next)
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={toggleTheme}>
      {isDark ? "Light mode" : "Dark mode"}
    </Button>
  )
}
