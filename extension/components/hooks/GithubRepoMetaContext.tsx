import { fetchRepoMeta } from "@/lib/api-service"
import { useEffect, useState } from "react"

import { useRepoMetaData } from "~components/hooks/useRepoinfo"

interface GithubRepoMeta {
  owner: string
  repo: string
  treeSHA: string
  ref_type: "branch" | "commit" | "tag"
  isPrivate?: boolean
}

export const useGithubRepoMeta = () => {
  const [repoMeta, setRepoMeta] = useState<GithubRepoMeta | undefined>(
    undefined
  )

  const repoData = useRepoMetaData()

  useEffect(() => {
    if (repoData.owner && repoData.repo) {
      const fetchRepoMetaData = async () => {
        try {
          const data = await fetchRepoMeta(
            repoData.owner,
            repoData.repo,
            repoData.treeSHA,
            repoData.ref_type
          )
          setRepoMeta({
            ...data,
            treeSHA: data.treeSHA || repoData.treeSHA || "",
            ref_type: repoData.ref_type!,
            owner: repoData.owner,
            repo: repoData.repo
          })
        } catch (error: any) {
          console.error("Error fetching repo meta:", error)
          if (error.response && error.response.status === 404) {
            setRepoMeta({
              owner: repoData.owner,
              repo: repoData.repo,
              treeSHA: "",
              isPrivate: true,
              ref_type: repoData.ref_type!
            })
          }
        }
      }

      fetchRepoMetaData()
    }
  }, [repoData])

  return repoMeta
}
