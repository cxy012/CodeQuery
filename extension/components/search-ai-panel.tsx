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

import { useRepoMetaData } from "~components/hooks/useRepoinfo"

export default function SearchAIPanel() {
  const { owner, repo, isPrivate, treeSHA } = useRepoMetaData()
  const repoMeta = useGithubRepoMeta()
  const [languageOptions, setLanguageOptions] = useState<Option[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<Option[]>([])
  const [question, setQuestion] = useState<string>("")
  const [potentialPaths, setPotentialPaths] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filePaths, setFilePaths] = useState<string>("")

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
    const url = `https://github.com/${owner}/${repo}/blob/${treeSHA}/${path}`
    window.open(url, "_blank")
  }

  async function handleSearchWithAI() {
    if (!question) {
      setStatusMessage("Please enter a question.")
      return
    }

    try {
      setIsLoading(true)
      setStatusMessage("Fetching repository file paths...")
      const response = await axios.post(
        `${process.env.PLASMO_PUBLIC_BACKEND_URL}api/search-files`,
        {
          owner,
          repo,
          languages: selectedLanguages.map((opt) => opt.value),
          treeSHA: repoMeta.treeSHA
        }
      )
      const fetchedFilePaths = response.data

      const { available } = await (
        window as any
      ).ai.languageModel.capabilities()

      if (available !== "no") {
        const session = await (window as any).ai.languageModel.create()
        const prompt = generateSearchPrompt(fetchedFilePaths)

        const result = await session.prompt(prompt)
        console.log("result: ", prompt)
        const paths = result.split(/\r?\n/)
        setPotentialPaths(paths)
        setStatusMessage("Successfully found files for the given question.")
      } else {
        setStatusMessage("Model is not available currently.")
      }
    } catch (error) {
      console.error("Error searching files with AI:", error)
      setStatusMessage("Failed to search files with AI.")
    } finally {
      setIsLoading(false)
    }
  }

  function generateSearchPrompt(filePaths: string) {
    let prompt = `You are provided with the following list of file paths from the ${owner}/${repo} GitHub repository. Your task is to determine the most relevant file paths that may contain core implementation logic related to the question: "${question}". Do not generate new paths, only select from the provided list.

Guidelines:
1. Only include core implementation files, and exclude any files that are related to testing, types, documentation, design, or configuration.
2. Provide only the top 5 most relevant results.
3. Ensure the response contains only file paths from the given list, separated by new lines, without any additional formatting or markdown.

Here is the list of file paths:
${filePaths}

Please provide the top 5 file paths that are most likely to contain the relevant core implementation logic.`

    return prompt
  }

  return (
    <>
      {isPrivate && (
        <div className="text-center text-sm mt-4 text-black">
          This extension is only available for public repositories.
        </div>
      )}

      <>
        <div className="mt-4">
          <Label className="font-bold">Current Model</Label>
          <div className="flex gap-2 justify-start">
            <Badge className="bg-blue-500 text-white">
              Gemini Nano (Built-in Model)
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
            onClick={() => handleSearchWithAI()}
            disabled={isLoading || isPrivate}>
            {isLoading ? (
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
