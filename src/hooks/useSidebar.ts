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
  const readyRef = useRef(false)

  const showSidebar = useCallback(async () => {
    if (pinnedRef.current || !readyRef.current) return
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    await getCurrentWindow().setPosition(
      new LogicalPosition(shownXRef.current, 0)
    )
  }, [])

  const hideSidebar = useCallback((delay = 200) => {
    if (pinnedRef.current || !readyRef.current) return
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(async () => {
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
    if (pinnedRef.current) {
      await win.setPosition(new LogicalPosition(shownXRef.current, 0))
    }
    readyRef.current = true
  }, [])

  useEffect(() => {
    positionWindow()
  }, [positionWindow])

  useEffect(() => {
    const handleResize = () => { positionWindow() }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [positionWindow])

  // Hide sidebar when window loses focus (unless pinned)
  useEffect(() => {
    let unlisten: (() => void) | undefined
    getCurrentWindow().onFocusChanged(({ payload: focused }) => {
      if (!focused && !pinnedRef.current && readyRef.current) {
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
