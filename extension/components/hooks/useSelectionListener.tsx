import { useEffect, useState } from "react"

type SelectionListenerOptions = {
  isSelectingCode: boolean
  onSelectCode: (
    code: string,
    lineStart: number,
    lineEnd: number,
    filePath: string
  ) => void
}

export function useSelectionListener({
  isSelectingCode,
  onSelectCode
}: SelectionListenerOptions) {
  const [selection, setSelection] = useState<{
    code: string
    filePath: string
  } | null>(null)
  const [hash, setHash] = useState<string>(window.location.hash)

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelectingCode) {
        const sel = window.getSelection()
        if (sel) {
          const selectedText = sel.toString().trim()
          if (selectedText.length > 0) {
            const path = window.location.pathname
            const filePath = path.split("/").pop() || ""
            setSelection({ code: selectedText, filePath })
            setHash(window.location.hash) // Update hash when selection is made
          }
        }
      }
    }

    const handleClick = () => {
      if (selection) {
        if (window.location.hash) {
          // Extract lineStart and lineEnd from hash
          const lineStart = parseInt(window.location.hash.substring(2), 10)
          const lineEnd = parseInt(
            window.location.hash.split("-").length === 1
              ? window.location.hash.substring(2)
              : window.location.hash.split("-")[1]?.substring(1),
            10
          )

          onSelectCode(selection.code, lineStart, lineEnd, selection.filePath)
          setSelection(null)
          setHash("")

          // Clear hash value in URL without reloading the page
          window.history.replaceState(null, "", window.location.pathname)
        }
      }
    }

    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("click", handleClick)
    }
  }, [isSelectingCode, onSelectCode, selection, hash])

  return null
}
