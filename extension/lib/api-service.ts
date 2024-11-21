import axios from "axios"

export const fetchModelInfos = async () => {
  const response = await axios.get(
    `${process.env.PLASMO_PUBLIC_BACKEND_URL}api/extension/model-configs`
  )
  return response.data
}

export const fetchRepoLanguages = async (owner: string, repo: string) => {
  const response = await axios.get(
    `${process.env.PLASMO_PUBLIC_BACKEND_URL}api/github/${owner}/${repo}/languages`,
    {
      params: { owner, repo }
    }
  )
  return response.data.languages
}

export const searchFilesWithAI = async (data: {
  question: string
  owner: string
  repo: string
  languages: string[]
  treeSHA: string
  modelConfigId: string
}) => {
  const response = await axios.post(
    `${process.env.PLASMO_PUBLIC_BACKEND_URL}api/ai/search-files`,
    data
  )
  return response.data
}

export const fetchRepoMeta = async (
  owner: string,
  repo: string,
  treeSHA: string,
  ref_type: string
) => {
  try {
    const response = await axios.get(
      `${process.env.PLASMO_PUBLIC_BACKEND_URL}api/github/repo-meta`,
      {
        params: { owner, repo, treeSHA, ref_type }
      }
    )
    return response.data
  } catch (error) {
    console.error("Error fetching repo meta from server:", error)
    throw error
  }
}
