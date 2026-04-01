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
  const [shouldRenderOverlay, setShouldRenderOverlay] = useState(isLoading)
  const [shouldRenderContent, setShouldRenderContent] = useState(!isLoading)
  const [isOverlayVisible, setIsOverlayVisible] = useState(isLoading)
  const [isContentVisible, setIsContentVisible] = useState(!isLoading)
  const fadeTimeoutRef = useRef<number | null>(null)
  const contentFadeFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (fadeTimeoutRef.current !== null) {
      window.clearTimeout(fadeTimeoutRef.current)
      fadeTimeoutRef.current = null
    }
    if (contentFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(contentFadeFrameRef.current)
      contentFadeFrameRef.current = null
    }

    if (isLoading) {
      setShouldRenderOverlay(true)
      setIsOverlayVisible(true)
      setIsContentVisible(false)
      return
    }

    setShouldRenderContent(true)
    setIsContentVisible(false)
    setIsOverlayVisible(false)
    contentFadeFrameRef.current = window.requestAnimationFrame(() => {
      setIsContentVisible(true)
      contentFadeFrameRef.current = null
    })
    fadeTimeoutRef.current = window.setTimeout(() => {
      setShouldRenderOverlay(false)
      fadeTimeoutRef.current = null
    }, LOADER_FADE_DURATION_MS)

    return () => {
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current)
        fadeTimeoutRef.current = null
      }
      if (contentFadeFrameRef.current !== null) {
        window.cancelAnimationFrame(contentFadeFrameRef.current)
        contentFadeFrameRef.current = null
      }
    }
  }, [isLoading])

  if (!shouldRenderContent && shouldRenderOverlay) {
    return <div className={className}>{loadingContent}</div>
  }

  return (
    <div className={cn("relative", className)}>
      <div
        aria-busy={isLoading}
        className={cn(
          "transition-opacity ease-out motion-reduce:transition-none",
          isContentVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${LOADER_FADE_DURATION_MS}ms` }}
      >
        {children}
      </div>

      {shouldRenderOverlay ? (
        <div
          aria-hidden={!isOverlayVisible}
          className={cn(
            "absolute inset-0 transition-opacity ease-out motion-reduce:transition-none",
            isOverlayVisible ? "opacity-100" : "pointer-events-none opacity-0"
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
