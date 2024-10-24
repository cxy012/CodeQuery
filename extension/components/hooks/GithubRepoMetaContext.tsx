import { fetchRepoMeta } from "@/lib/api-service"
import React, { createContext, useContext, useEffect, useState } from "react"

interface GithubRepoMeta {
  owner: string
  repo: string
  treeSHA: string
  ref_type: "branch" | "commit" | "tag"
  isPrivate?: boolean
  lineStart?: number
  lineEnd?: number
  codeSelected?: string
  filePath?: string
}

const GithubRepoMetaContext = createContext<GithubRepoMeta | undefined>(
  undefined
)

export const GithubRepoMetaProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [repoMeta, setRepoMeta] = useState<GithubRepoMeta | undefined>(
    undefined
  )

  useEffect(() => {
    const path = window.location.pathname.substring(1)
    const parts = path.split("/")
    if (parts.length >= 2) {
      const owner = parts[0]
      const repo = parts[1]

      let treeSHA: string | undefined
      let ref_type: "branch" | "commit" | "tag" | undefined

      const commitMatch = window.location.pathname.match(
        /\/blob\/([0-9a-f]{40})/
      )
      if (commitMatch) {
        treeSHA = commitMatch[1]
        ref_type = "commit"
      }

      if (!treeSHA) {
        const branchOrTagElement = document.querySelector('[data-hotkey="w"]')
        treeSHA = branchOrTagElement?.textContent?.trim()

        if (treeSHA) {
          const ariaLabel = branchOrTagElement?.getAttribute("aria-label") || ""
          if (ariaLabel.includes("tag")) {
            ref_type = "tag"
          } else {
            ref_type = "branch"
          }
        }
      }

      const fetchRepoMetaData = async () => {
        try {
          const data = await fetchRepoMeta(owner, repo, treeSHA, ref_type)
          const filePathElement = document.querySelector("span.js-path-segment")
          const filePath = filePathElement?.textContent?.trim()
          setRepoMeta({
            ...data,
            treeSHA: data.treeSHA || treeSHA,
            branch: treeSHA,
            filePath: filePath,
            ref_type: ref_type!
          })
        } catch (error: any) {
          console.error("Error fetching repo meta:", error)

          if (error.response && error.response.status === 403) {
            setRepoMeta({
              owner,
              repo,
              treeSHA: "",
              isPrivate: true,
              ref_type: ref_type!
            })
          }
        }
      }

      fetchRepoMetaData()
    }
  }, [window.location.pathname])

  useEffect(() => {
    const updateSelectionAndLines = () => {
      const lineMatch = window.location.hash.match(/#L(\d+)(-L(\d+))?/)
      const lineStart = lineMatch ? parseInt(lineMatch[1], 10) : undefined
      const lineEnd = lineMatch
        ? lineMatch[3]
          ? parseInt(lineMatch[3], 10)
          : parseInt(lineMatch[1], 10)
        : undefined

      const selection = window.getSelection()
      const codeSelected = selection?.toString().trim()

      setRepoMeta((data) => ({
        ...data,
        lineStart,
        lineEnd,
        codeSelected: codeSelected?.length ? codeSelected : undefined
      }))
    }

    updateSelectionAndLines()

    const observer = new MutationObserver(() => {
      updateSelectionAndLines()
    })
    observer.observe(document, {
      childList: true,
      subtree: true
    })

    document.addEventListener("selectionchange", updateSelectionAndLines)

    return () => {
      observer.disconnect()
      document.removeEventListener("selectionchange", updateSelectionAndLines)
    }
  }, [window.location.hash])

  return (
    <GithubRepoMetaContext.Provider value={repoMeta}>
      {children}
    </GithubRepoMetaContext.Provider>
  )
}

export const useGithubRepoMeta = () => {
  const context = useContext(GithubRepoMetaContext)
  if (context === undefined) {
    throw new Error(
      "useGithubRepoMeta must be used within a GithubRepoMetaProvider"
    )
  }
  return context
}
