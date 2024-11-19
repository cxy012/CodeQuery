import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/lib/markdownRenderer"
import { Clipboard, Loader2, Trash } from "lucide-react"
import React, { useEffect, useState } from "react"

import predefinedPrompts from "../lib/predefined-prompts"
import { useSelectionListener } from "./hooks/useSelectionListener"

type CodeSelectMode = "code" | "context"

interface CodeContext {
  filePath: string
  lineStart: number
  lineEnd: number
  code: string
}

export default function AskAIPanel() {
  const [promptInput, setPromptInput] = useState("")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [selectedCodeForAI, setSelectedCodeForAI] = useState<CodeContext>()
  const [selectedCodeContextForAI, setSelectedCodeContextForAI] = useState<
    CodeContext[]
  >([])
  const [codeSelectMode, setCodeSelectMode] = useState<CodeSelectMode>()
  const [selectedPrompt, setSelectedPrompt] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [completion, setCompletion] = useState<string | null>(null)

  const isPrivate = false

  useSelectionListener({
    isSelectingCode: codeSelectMode !== undefined,
    onSelectCode: (code, lineStart, lineEnd, filePath) => {
      const newCodeContext = { code, lineStart, lineEnd, filePath }
      if (codeSelectMode === "code") {
        setSelectedCodeForAI(newCodeContext)
      }
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
    // Determine which prompt to use based on whether custom or predefined prompt is selected
    if (!promptInput && !selectedPrompt) {
      return
    }

    let newPrompt = selectedPrompt || promptInput

    if (selectedCodeForAI) {
      newPrompt += `\n\nCode:\n${selectedCodeForAI.filePath}:${selectedCodeForAI.lineStart}-${selectedCodeForAI.lineEnd}\n${selectedCodeForAI.code}\n\n`
    }
    if (selectedCodeContextForAI.length > 0) {
      newPrompt += `\n\nContext Code:\n`
      selectedCodeContextForAI.forEach((codeContext) => {
        newPrompt += `${codeContext.filePath}:${codeContext.lineStart}-${codeContext.lineEnd}\n${codeContext.code}\n\n`
      })
    }

    setPromptInput(newPrompt)
  }, [selectedPrompt, promptInput, selectedCodeForAI, selectedCodeContextForAI])

  const handlePredefinedPromptSelect = (promptText: string) => {
    setSelectedPrompt(promptText)
    setPromptInput("")
  }

  const handleCustomPromptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPromptInput(e.target.value)
    setSelectedPrompt("")
  }

  async function handleSendPrompt() {
    if (!promptInput) {
      setStatusMessage("Please enter a prompt.")
      return
    }
    try {
      setIsLoading(true)
      const { available } = await (
        window as any
      ).ai.languageModel.capabilities()

      if (available !== "no") {
        const session = await (window as any).ai.languageModel.create()
        const stream = session.promptStreaming(promptInput)
        console.log(promptInput)
        setCompletion("") // Start with an empty completion
        for await (const chunk of stream) {
          setCompletion((prev) => (prev ?? "") + chunk)
        }
      } else {
        setStatusMessage("Model is not available currently.")
      }
    } catch (error) {
      console.error("Prompt failed:", error)
      setStatusMessage("Error occurred while processing your request.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptInput || selectedPrompt)
      setStatusMessage("Prompt copied to clipboard successfully!")
    } catch (err) {
      console.error(err)
      setStatusMessage("Failed to copy the generated prompt.")
    }
  }

  return (
    <>
      {isPrivate && (
        <div className="text-center text-sm mt-4 text-black">
          This extension is only available for public repositories.
        </div>
      )}
      <>
        <div className="mx-auto p-4 mb-2 ml-1 space-y-4 overflow-auto">
          {!completion && (
            <div>
              {/* Model Information Section */}
              <Label className="font-bold">Current Model: </Label>
              <div className="flex gap-2 justify-start mt-1">
                <Badge className="bg-blue-500 text-white">
                  Gemini Nano (Built-in Model)
                </Badge>
              </div>

              {/* Predefined Prompt Selection Section */}
              <div className="mt-4">
                <Label className="font-bold">Select Predefined Prompt</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {predefinedPrompts.map((prompt) => (
                    <Badge
                      key={prompt.label}
                      className={`cursor-pointer ${
                        selectedPrompt === prompt.text
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                      onClick={() => handlePredefinedPromptSelect(prompt.text)}>
                      {prompt.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Section */}
              <div className="flex flex-col gap-1.5 mt-6">
                <div className="flex justify-between">
                  <Label className="font-bold">Custom Prompt</Label>
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
                  onKeyDown={(e) => e.stopPropagation()}
                  value={promptInput}
                  onChange={handleCustomPromptChange}
                  placeholder="Enter your custom prompt here..."
                />
              </div>

              {/* select code for AI */}
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

                {selectedCodeContextForAI.length > 0 ? (
                  selectedCodeContextForAI.map((code) => (
                    <div
                      key={`${code.filePath}-${code.lineStart}-${code.lineEnd}`}
                      className="flex h-auto w-full px-3 py-2 rounded-md border border-input shadow-sm text-xs cursor-not-allowed opacity-50">
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
                      handleSendPrompt()
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-foreground text-background"
                    disabled={isPrivate}>
                    Send
                  </Button>
                )}
              </div>
            </div>
          )}
          {completion && (
            <div className="my-4">
              <Button
                size="sm"
                variant="outline"
                className="bg-foreground text-background mb-2"
                onClick={() => setCompletion(null)}>
                back
              </Button>
              {/* <div className="whitespace-pre-wrap text-sm">{completion}</div> */}
              <MarkdownRenderer markdown={completion} />
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
