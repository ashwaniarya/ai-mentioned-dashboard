"use client"

import { useEffect, useRef, useState } from "react"

import { LOADER_FADE_DURATION_MS } from "@/config"
import { cn } from "@/lib/utils"

interface LoadingFadeProps {
  isLoading: boolean
  loadingContent: React.ReactNode
  children: React.ReactNode
  className?: string
}

function LoadingFade({
  isLoading,
  loadingContent,
  children,
  className,
}: LoadingFadeProps) {
  const [hasLoadedContent, setHasLoadedContent] = useState(!isLoading)
  const [isOverlayMounted, setIsOverlayMounted] = useState(isLoading)
  const overlayHideTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (overlayHideTimeoutRef.current !== null) {
      window.clearTimeout(overlayHideTimeoutRef.current)
      overlayHideTimeoutRef.current = null
    }

    if (isLoading) {
      setIsOverlayMounted(true)
      return
    }

    setHasLoadedContent(true)
    overlayHideTimeoutRef.current = window.setTimeout(() => {
      setIsOverlayMounted(false)
      overlayHideTimeoutRef.current = null
    }, LOADER_FADE_DURATION_MS)

    return () => {
      if (overlayHideTimeoutRef.current !== null) {
        window.clearTimeout(overlayHideTimeoutRef.current)
        overlayHideTimeoutRef.current = null
      }
    }
  }, [isLoading])

  if (!hasLoadedContent && isOverlayMounted) {
    return <div className={className}>{loadingContent}</div>
  }

  return (
    <div className={cn("relative", className)}>
      {hasLoadedContent ? (
        <div
          aria-busy={isLoading}
          className={cn(
            "transition-opacity ease-out motion-reduce:transition-none",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          style={{ transitionDuration: `${LOADER_FADE_DURATION_MS}ms` }}
        >
          {children}
        </div>
      ) : null}

      {isOverlayMounted ? (
        <div
          aria-hidden={!isLoading}
          className={cn(
            "absolute inset-0 transition-opacity ease-out motion-reduce:transition-none",
            isLoading ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          style={{ transitionDuration: `${LOADER_FADE_DURATION_MS}ms` }}
        >
          {loadingContent}
        </div>
      ) : null}
    </div>
  )
}

export { LoadingFade }
