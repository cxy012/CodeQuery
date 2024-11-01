import { debounce } from "lodash"
import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

interface RepoMetaDataContextProps {
  owner: string
  repo: string
  treeSHA?: string
  ref_type?: "branch" | "commit" | "tag"
  filePath?: string
  pageType: "blob" | "repo" | "other"
  isPrivate: boolean
}

const RepoMetaDataContext = createContext<RepoMetaDataContextProps | undefined>(
  undefined
)

export const RepoMetaDataProvider = ({ children }: { children: ReactNode }) => {
  const [repoData, setRepoData] = useState<RepoMetaDataContextProps>({
    owner: "",
    repo: "",
    pageType: "other",
    isPrivate: false
  })

  const updateRepoData = debounce(() => {
    const path = window.location.pathname.substring(1)
    const parts = path.split("/")
    if (parts.length >= 2) {
      const owner = parts[0]
      const repo = parts[1]

      let treeSHA: string | undefined
      let ref_type: "branch" | "commit" | "tag" | undefined
      let filePath: string | undefined
      let pageType: "blob" | "repo" | "other" = "other"
      let isPrivate = false

      // Check for aria-label attributes to identify the page type
      const repoTitleElement = document.querySelector(
        '[aria-label="Repository"]'
      )
      const repoHeaderElement = document.querySelector('span[itemprop="name"]')

      const isBlobPage =
        document.querySelector('[aria-label="file content"]') !== null

      if (isBlobPage) {
        pageType = "blob"
      } else if (repoTitleElement || repoHeaderElement) {
        pageType = "repo"
      }

      // Check if repository is private
      const lockIcon = document.querySelector(".octicon-lock")
      isPrivate = lockIcon !== null

      const commitMatch = window.location.pathname.match(
        /(?:\/blob\/|\/tree\/)([0-9a-f]{40})/
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

      if (pageType === "blob") {
        filePath = path.split(`/blob/${treeSHA}/`)[1] || ""
      }

      const newRepoData: RepoMetaDataContextProps = {
        owner,
        repo,
        treeSHA,
        ref_type,
        filePath,
        pageType,
        isPrivate
      }

      // Compare newRepoData with the current repoData
      if (JSON.stringify(newRepoData) !== JSON.stringify(repoData)) {
        setRepoData(newRepoData)
      }
    }
  }, 500)

  useEffect(() => {
    updateRepoData()

    const observer = new MutationObserver(() => {
      updateRepoData()
    })

    const targetNode = document.querySelector(".repository-content")
    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <RepoMetaDataContext.Provider value={repoData}>
      {children}
    </RepoMetaDataContext.Provider>
  )
}

export const useRepoMetaData = () => {
  const context = useContext(RepoMetaDataContext)
  if (!context) {
    throw new Error(
      "useRepoMetaData must be used within a RepoMetaDataProvider"
    )
  }
  return context
}
