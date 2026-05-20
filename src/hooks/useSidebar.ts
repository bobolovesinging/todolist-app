import { useState, useCallback, useEffect, useRef } from "react"
import { getCurrentWindow, primaryMonitor } from "@tauri-apps/api/window"
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi"

interface SidebarConfig {
  sidebarWidth: number
  tabVisible: number
}

export function useSidebar(config: SidebarConfig) {
  const [pinned, setPinned] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hiddenXRef = useRef(0)
  const shownXRef = useRef(0)
  const pinnedRef = useRef(false)

  const showSidebar = useCallback(async () => {
    if (pinnedRef.current) return
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    await getCurrentWindow().setPosition(
      new LogicalPosition(shownXRef.current, 0)
    )
  }, [])

  const hideSidebar = useCallback((delay = 300) => {
    if (pinnedRef.current) return
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(async () => {
      // Don't hide if user is actively editing
      const active = document.activeElement
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return
      await getCurrentWindow().setPosition(
        new LogicalPosition(hiddenXRef.current, 0)
      )
      hideTimerRef.current = null
    }, delay)
  }, [])

  const togglePin = useCallback(() => {
    setPinned(prev => {
      const next = !prev
      pinnedRef.current = next
      if (!next) {
        hideSidebar(0)
      }
      return next
    })
  }, [hideSidebar])

  const configRef = useRef(config)
  configRef.current = config

  const positionWindow = useCallback(async () => {
    const { sidebarWidth, tabVisible } = configRef.current
    const monitor = await primaryMonitor()
    if (!monitor) return
    const scale = monitor.scaleFactor
    const logicalW = monitor.size.width / scale
    const logicalH = monitor.size.height / scale
    hiddenXRef.current = logicalW - tabVisible
    shownXRef.current = logicalW - sidebarWidth

    const win = getCurrentWindow()
    await win.setSize(new LogicalSize(sidebarWidth, logicalH))
    // Start visible by default, will auto-hide after first mouse leave
    if (pinnedRef.current) {
      await win.setPosition(new LogicalPosition(shownXRef.current, 0))
    }
    // Don't set to hidden on initial load; let Rust show it first
  }, [])

  useEffect(() => {
    positionWindow()
  }, [positionWindow])

  useEffect(() => {
    const handleResize = () => { positionWindow() }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [positionWindow])

  // Hide sidebar when mouse leaves the entire window
  useEffect(() => {
    const handleDocMouseLeave = () => {
      hideSidebar(0)
    }
    document.addEventListener("mouseleave", handleDocMouseLeave)
    return () => document.removeEventListener("mouseleave", handleDocMouseLeave)
  }, [hideSidebar])

  // Hide sidebar when window loses focus (unless pinned)
  useEffect(() => {
    let unlisten: (() => void) | undefined
    getCurrentWindow().onFocusChanged(({ payload: focused }) => {
      if (!focused && !pinnedRef.current) {
        hideSidebar(0)
      }
    }).then(fn => { unlisten = fn })
    return () => { unlisten?.() }
  }, [hideSidebar])

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    showSidebar()
  }, [showSidebar])

  const handleMouseLeave = useCallback(() => {
    hideSidebar()
  }, [hideSidebar])

  return { pinned, togglePin, handleMouseEnter, handleMouseLeave, showSidebar }
}
