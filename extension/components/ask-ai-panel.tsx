
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { plugins } from "@/lib/plugins"

// import { deserializeMd } from "@udecode/plate-serializer-md"
import axios from "axios"
import { Clipboard, Loader2, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useMutation } from "react-query"

import { useModelConfig } from "./hooks/useModelConfigsContext"
import { useRepoMetaData } from "./hooks/useRepoinfo"
import { useSelectionListener } from "./hooks/useSelectionListener"

type CodeSelectMode = "code" | "context"

interface CodeContext {
  filePath: string
  lineStart: number
  lineEnd: number
  code: string
}

export default function AskAIPanel() {
  const { ModelConfig } = useModelConfig()
  const [promptInput, setPromptInput] = useState(
    ModelConfig ? ModelConfig.prompt : ""
  )
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  // const editor = useMemo(() => withTReact(createPlateEditor({ plugins })), [])
  const [prompt, setPrompt] = useState(promptInput)

  const [selectedCodeForAI, setSelectedCodeForAI] = useState<CodeContext>()
  const [selectedCodeContextForAI, setSelectedCodeContextForAI] = useState<
    CodeContext[]
  >([])
  const [codeSelectMode, setCodeSelectMode] = useState<CodeSelectMode>()

  // const { isPrivate } = useRepoMetaData()
  const  isPrivate =false;
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
    let newPrompt = promptInput
    if (selectedCodeForAI) {
      newPrompt += `\n\nCode:\n${selectedCodeForAI.filePath}:${selectedCodeForAI.lineStart}-${selectedCodeForAI.lineEnd}\n${selectedCodeForAI.code}\n\n`
    }
    if (selectedCodeContextForAI.length > 0) {
      newPrompt += `\n\nContext Code:\n`
      selectedCodeContextForAI.forEach((codeContext) => {
        newPrompt += `${codeContext.filePath}:${codeContext.lineStart}-${codeContext.lineEnd}\n${codeContext.code}\n\n`
      })
    }
    setPrompt(newPrompt)
  }, [promptInput, selectedCodeForAI, selectedCodeContextForAI])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setStatusMessage("Prompt copied to clipboard successfully!")
    } catch (err) {
      console.error(err)
      setStatusMessage("Failed to copy the generated prompt.")
    }
  }

  const askAIMutation = useMutation(
    (prompt: string) =>
      axios
        .post(`${process.env.PLASMO_PUBLIC_BACKEND_URL}api/ai/generate-text`, {
          modelConfigId: ModelConfig!.id,
          prompt: prompt
        })
        .then((res) => res.data),
    {
      onSuccess: (data: any) => {
        // if (editor) {
        //   editor.insertNode(deserializeMd(editor, data.text))
        //   setStatusMessage("AI response generated successfully!")
        // }
      },
      onError: (err: Error) => {
        console.error(err)
        setStatusMessage("Failed to generate AI response.")
      }
    }
  )

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
          {ModelConfig && (
            <div className="flex justify-between">
              <Badge variant="secondary" className="h-5 cursor-pointer">
                {ModelConfig.name}
              </Badge>
            </div>
          )}

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
              {prompt.length} characters
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
                // editor.reset = () => {
                //   editor.children = [{ type: "p", children: [{ text: "" }] }]
                //   editor.onChange()
                // }
              }}
              size="sm"
              variant="secondary">
              Reset
            </Button>
            {askAIMutation.isLoading ? (
              <Button size="sm" disabled>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  if (!ModelConfig) {
                    setStatusMessage(
                      "Please setup your ai model before ask ai."
                    )
                    return
                  }
                  if (
                    !selectedCodeForAI &&
                    selectedCodeContextForAI.length === 0
                  ) {
                    setStatusMessage(
                      "Please ensure that selected code are provided."
                    )
                    return
                  }
                  console.log(selectedCodeContextForAI)
                  console.log(selectedCodeForAI)
                  askAIMutation.mutate(prompt)
                }}
                size="sm"
                variant="outline"
                className="bg-foreground text-background"
                disabled={isPrivate}>
                Send
              </Button>
            )}
          </div>

          {askAIMutation.data && (
            <div className="my-4">
              <Textarea />
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
