import { useGithubRepoMeta } from "@/components/hooks/GithubRepoMetaContext"
import { ScrollArea } from "@/components/plate-ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import MultipleSelector from "@/components/ui/multiple-selector"
import type { Option } from "@/components/ui/multiple-selector"
import { Textarea } from "@/components/ui/textarea"
import { fetchRepoLanguages } from "@/lib/api-service"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useMutation } from "react-query"

import { useRepoMetaData } from "~components/hooks/useRepoinfo"

export default function SearchAIPanel() {
  const { owner, repo, isPrivate } = useRepoMetaData()
  const repoMeta = useGithubRepoMeta()
  const [languageOptions, setLanguageOptions] = useState<Option[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<Option[]>([])
  const [question, setQuestion] = useState<string>("")
  const [potentialPaths, setPotentialPaths] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [modelType, setModelType] = useState("gemini-1.5-flash-latest")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const loadRepoLanguages = async () => {
      if (!owner || !repo) return

      setIsLoading(true)
      !isPrivate && setStatusMessage("Loading repository languages...")
      try {
        const languages = await fetchRepoLanguages(owner, repo)
        const sortedLanguageOptions = generateLanguageOptions(languages)
        setLanguageOptions(sortedLanguageOptions)
        setSelectedLanguages([sortedLanguageOptions[0]])
        setStatusMessage("")
      } catch (error) {
        console.error("Error fetching repository languages:", error)
        !isPrivate && setStatusMessage("Failed to fetch repository languages.")
      } finally {
        setIsLoading(false)
      }
    }
    loadRepoLanguages()
  }, [owner, repo])

  const handleRedirect = (path: string) => {
    const url = `https://github.com/${owner}/${repo}/blob/${repoMeta.treeSHA}/${path}`
    window.open(url, "_self")
  }
  const { mutate: searchWithAI, isLoading: isSearchingAI } = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.PLASMO_PUBLIC_BACKEND_URL}api/search-files`,
        {
          question,
          owner,
          repo,
          languages: selectedLanguages.map((opt) => opt.value),
          treeSHA: repoMeta.treeSHA,
          modelType
        },
        {
          timeout: 10000
        }
      )
      return response.data
    },
    onSuccess: (paths) => {
      setPotentialPaths(paths)
      setStatusMessage("Successfully found files for the given question.")
    },
    onError: (error) => {
      console.error("Error searching files with AI:", error)
      setStatusMessage("Failed to search files with AI.")
    }
  })

  return (
    <>
      {isPrivate && (
        <div className="text-center text-sm mt-4 text-black">
          This extension is only available for public repositories.
        </div>
      )}

      <>
        <div className="mt-4">
          <Label className="font-bold">Select Model</Label>
          <div className="flex gap-2 justify-start">
            <Badge
              className={`cursor-pointer ${modelType === "gemini-1.5-flash-latest" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
              onClick={() => setModelType("gemini-1.5-flash-latest")}>
              Gemini 1.5 Flash
            </Badge>
            <Badge
              className={`cursor-pointer ${modelType === "gemini-1.5-pro-latest" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
              onClick={() => setModelType("gemini-1.5-pro-latest")}>
              Gemini 1.5 Pro
            </Badge>
          </div>
        </div>
        <div className="flex justify-center pt-4 pb-5 px-2">
          <Textarea
            className="w-full focus-visible:ring-0"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Ask questions to navigate your repo code."
            disabled={isPrivate}
          />
        </div>
        <div className="flex justify-center pb-5 px-2">
          <div className="w-full">
            <MultipleSelector
              maxSelected={4}
              value={selectedLanguages}
              onChange={setSelectedLanguages}
              options={languageOptions}
              placeholder="Select languages to ASK with AI..."
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                  no programming languages found.
                </p>
              }
              disabled={isPrivate}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => searchWithAI()}
            disabled={isSearchingAI || isPrivate}>
            {isSearchingAI ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Search with AI"
            )}
          </Button>
        </div>

        {statusMessage && (
          <div className="text-center text-sm mt-4 text-foreground">
            {statusMessage}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <ScrollArea className="w-full max-h-70 p-4 overflow-auto">
            <div className="flex flex-col items-start gap-1">
              {potentialPaths.map((path) => (
                <Badge
                  key={path}
                  variant="secondary"
                  className="cursor-pointer overflow-auto w-full"
                  onClick={(e) => {
                    e.preventDefault()
                    handleRedirect(path)
                  }}>
                  {path}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </>
    </>
  )
}

function generateLanguageOptions(languages: { [language: string]: number }) {
  return Object.keys(languages)
    .sort((a, b) => languages[b] - languages[a])
    .map((language) => ({ label: language, value: language }))
}
