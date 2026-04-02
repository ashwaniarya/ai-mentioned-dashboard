"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

function readInitialDocumentHasDarkClass(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function ColorSchemeToggleButton() {
  const [isDark, setIsDark] = useState(readInitialDocumentHasDarkClass);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function handleToggleColorScheme() {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggleColorScheme}
    >
      {isDark ? "Light mode" : "Dark mode"}
    </Button>
  );
}
