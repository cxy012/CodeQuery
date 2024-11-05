import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCompletion } from "ai/react"
import axios from "axios"
import { Clipboard, Loader2, Trash } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
// import { plugins } from "@/lib/plugins"

// import { deserializeMd } from "@udecode/plate-serializer-md"
import ReactMarkdown from "react-markdown"
import { useMutation } from "react-query"
import remarkGfm from "remark-gfm"

import { useModelConfig } from "./hooks/useModelConfigsContext"
import { useRepoMetaData } from "./hooks/useRepoinfo"
import { useSelectionListener } from "./hooks/useSelectionListener"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"

type CodeSelectMode = "code" | "context"

interface CodeContext {
  filePath: string
  lineStart: number
  lineEnd: number
  code: string
}
const PROMPT_TEMPLATE =
  "Explain what the selected code does in simple terms under given code context if provided. Assume the audience is a beginner programmer who has just " +
  "learned the language features and basic syntax."

export default function AskAIPanel() {
  const [promptInput, setPromptInput] = useState(
    PROMPT_TEMPLATE ? PROMPT_TEMPLATE : ""
  )
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [selectedCodeForAI, setSelectedCodeForAI] = useState<CodeContext>()
  const [selectedCodeContextForAI, setSelectedCodeContextForAI] = useState<
    CodeContext[]
  >([])
  const [codeSelectMode, setCodeSelectMode] = useState<CodeSelectMode>()
  const [modelType, setModelType] = useState("flash")

  const isPrivate = false

  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput
  } = useCompletion({
    api: "http://localhost:3000/api/generate-text"
  })
  useSelectionListener({
    isSelectingCode: codeSelectMode !== undefined,
    onSelectCode: (code, lineStart, lineEnd, filePath) => {
      const newCodeContext = { code, lineStart, lineEnd, filePath }
      if (codeSelectMode === "code") setSelectedCodeForAI(newCodeContext)

      if (codeSelectMode === "context") {
        setSelectedCodeContextForAI((prevContexts) => [
          ...prevContexts,
          newCodeContext
        ])
      }
      setCodeSelectMode(undefined)
    }
  })

  const handleDeleteContextCode = (
    lineStart: number,
    lineEnd: number,
    filePath: string
  ) => {
    setSelectedCodeContextForAI((prevContexts) =>
      prevContexts.filter(
        (contextCode) =>
          !(
            contextCode.lineStart === lineStart &&
            contextCode.lineEnd === lineEnd &&
            contextCode.filePath === filePath
          )
      )
    )
  }

  useEffect(() => {
    let newPrompt = PROMPT_TEMPLATE
    if (selectedCodeForAI) {
      newPrompt += `\n\nCode:\n${selectedCodeForAI.filePath}:${selectedCodeForAI.lineStart}-${selectedCodeForAI.lineEnd}\n${selectedCodeForAI.code}\n\n`
    }
    if (selectedCodeContextForAI.length > 0) {
      newPrompt += `\n\nContext Code:\n`
      selectedCodeContextForAI.forEach((codeContext) => {
        newPrompt += `${codeContext.filePath}:${codeContext.lineStart}-${codeContext.lineEnd}\n${codeContext.code}\n\n`
      })
    }
    setInput(newPrompt)
    setPromptInput(newPrompt)
  }, [selectedCodeForAI, selectedCodeContextForAI])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptInput)
      setStatusMessage("Prompt copied to clipboard successfully!")
    } catch (err) {
      console.error(err)
      setStatusMessage("Failed to copy the generated prompt.")
    }
  }

  // const askAIMutation = useMutation(
  //   (prompt: string) =>
  //     axios
  //       .post(`http://localhost:3000/api/generate-text`, {
  //         prompt,
  //         modelType
  //       })
  //       .then((res) => res.data),
  //   {
  //     onSuccess: (data: any) => {
  //       setStatusMessage("AI response generated successfully!")
  //     },
  //     onError: (err: Error) => {
  //       console.error(err)
  //       setStatusMessage("Failed to generate AI response.")
  //     }
  //   }
  // )
  const markdown = "# Hi, *Pluto*!"
  return (
    <>
      {isPrivate && (
        <div className="text-center text-sm mt-4 text-black">
          This extension is only available for public repositories. Please visit
          the{" "}
          <a
            href="https://dashboard.coexplain.com/dashboard"
            className="text-blue-500 underline">
            dashboard
          </a>{" "}
          for more information.
        </div>
      )}
      <>
        <div className="mx-auto p-4 mb-2 ml-1 space-y-4 overflow-auto">
          <div className="flex justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Model:{" "}
                  <Badge className="ml-2">
                    {modelType === "flash"
                      ? "Gemini 1.5 Flash"
                      : "Gemini 1.5 Pro"}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setModelType("flash")}>
                  Gemini 1.5 Flash
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setModelType("pro")}>
                  Gemini 1.5 Pro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <div className="flex justify-between">
              <Label htmlFor="prompt">Prompt</Label>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleCopy()
                }}
                variant="ghost"
                className="p-2 h-3 justify-end">
                <Clipboard className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              {promptInput.length} characters
            </div>
            <Textarea
              className="text-xs overflow-hidden"
              id="prompt"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
            />
          </div>

          {/* select code for AI */}
          <div>
            <div className="flex flex-col mt-2">
              <div className="flex items-center justify-between">
                <Label>Target Code</Label>
                <Button
                  onClick={() => {
                    setCodeSelectMode("code")
                    setSelectedCodeForAI(undefined)
                  }}
                  disabled={codeSelectMode === "code" || isPrivate}
                  variant="outline"
                  size="xs">
                  Select
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 mb-2">
                Click [Select] to choose code for AI analysis.
              </p>
            </div>
            <div
              className="flex h-auto w-full px-3 py-2 rounded-md border border-input shadow-sm text-xs cursor-not-allowed opacity-50"
              id="selected-code">
              <pre className="whitespace-pre-wrap font-sans">
                {selectedCodeForAI
                  ? `${selectedCodeForAI.filePath}:${selectedCodeForAI.lineStart}-${selectedCodeForAI.lineEnd}`
                  : "line_range"}
              </pre>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <Textarea
                className="text-xs overflow-hidden font-sans"
                value={selectedCodeForAI?.code || "Code content for AI..."}
                disabled
                readOnly
              />
            </div>
          </div>

          {/* select code context for AI */}
          <div>
            <div className="flex flex-col mt-2">
              <div className="flex items-center justify-between">
                <Label>Context Code</Label>
                <Button
                  onClick={() => setCodeSelectMode("context")}
                  disabled={codeSelectMode === "context" || isPrivate}
                  variant="outline"
                  size="xs">
                  Select
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 mb-2">
                Click [Select] to identify the relevant context code for AI
                analysis.
              </p>
            </div>

            {selectedCodeContextForAI.length > 0 ? (
              selectedCodeContextForAI.map((code) => (
                <div className="flex h-auto w-full px-3 py-2 rounded-md border border-input shadow-sm text-xs cursor-not-allowed opacity-50">
                  <pre className="whitespace-pre-wrap">{`${code.filePath}:${code.lineStart}-${code.lineEnd}`}</pre>
                  <Button
                    onClick={() =>
                      handleDeleteContextCode(
                        code.lineStart,
                        code.lineEnd,
                        code.filePath
                      )
                    }
                    size="xs"
                    variant="ghost">
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex h-auto w-full px-3 py-2 rounded-md border border-input shadow-sm text-xs cursor-not-allowed opacity-50">
                <pre className="whitespace-pre-wrap">line_range</pre>
              </div>
            )}
          </div>

          <div className="flex mt-4 justify-end gap-3">
            <Button
              onClick={(e) => {
                e.preventDefault()
                setCodeSelectMode(undefined)
                setSelectedCodeForAI(undefined)
                setSelectedCodeContextForAI([])
              }}
              size="sm"
              variant="secondary">
              Reset
            </Button>
            {isLoading ? (
              <Button size="sm" disabled>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  if (
                    !selectedCodeForAI &&
                    selectedCodeContextForAI.length === 0
                  ) {
                    setStatusMessage(
                      "Please ensure that selected code are provided."
                    )
                    return
                  }
                  //askAIMutation.mutate(promptInput)
                  handleSubmit()
                }}
                size="sm"
                variant="outline"
                className="bg-foreground text-background"
                disabled={isPrivate}>
                Send
              </Button>
            )}
          </div>
          {/* 
          {askAIMutation.data && (
            <div className="my-4">
              <Textarea value={askAIMutation.data.text} readOnly />
            </div>
          )} */}

          {completion && (
            <div className="my-4">
              {/* <Textarea value={completion} rows={8} readOnly /> */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // 表格样式
                  table: ({ node, ...props }) => (
                    <table
                      className="border-collapse border border-slate-300 dark:border-slate-700"
                      {...props}
                    />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr
                      className="border-b border-slate-300 dark:border-slate-700"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className="border border-slate-300 dark:border-slate-700 px-4 py-2"
                      {...props}
                    />
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-semibold"
                      {...props}
                    />
                  ),
                  // 任务列表样式
                  li: ({ node, className, ...props }) => {
                    if (className?.includes("task-list-item")) {
                      return (
                        <li className="flex items-start gap-2" {...props} />
                      )
                    }
                    return <li {...props} />
                  },
                  // 代码块样式
                  code({ node, inline, className, children, ...props }) {
                    return (
                      <code
                        className={`${
                          inline
                            ? "bg-gray-200 dark:bg-gray-800 rounded px-1"
                            : "block bg-gray-200 dark:bg-gray-800 p-4 rounded"
                        }`}
                        {...props}>
                        {children}
                      </code>
                    )
                  }
                }}>
                {completion}
              </ReactMarkdown>
            </div>
          )}
          {statusMessage && (
            <div className="text-sm text-foreground mt-2">{statusMessage}</div>
          )}
        </div>
      </>
    </>
  )
}
