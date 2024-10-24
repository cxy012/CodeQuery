import { Cross1Icon } from "@radix-ui/react-icons"
import cssText from "data-text:~style.css"
import { ChevronLeft } from "lucide-react"
import { useTheme } from "next-themes"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

import AskAiPanel from "~components/ask-ai-panel"
import SearchAIPanel from "~components/search-ai-panel"
import { Button } from "~components/ui/button"

// Inject to the webpage itself
import "../css/github-sidebar-base.css"

import { ThemeProvider } from "next-themes"

import { GithubRepoMetaProvider } from "~components/hooks/GithubRepoMetaContext"
import { ModelConfigProvider } from "~components/hooks/useModelConfigsContext"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"]
}

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText.replaceAll(":root", ":host(plasmo-csui)")
  return style
}

export const getShadowHostId = () => "plasmo-sidebar"

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <GithubRepoMetaProvider>
          <ModelConfigProvider>
            <Sidebar />
          </ModelConfigProvider>
        </GithubRepoMetaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

const Sidebar = () => {
  // control the open or close of the sidebar
  const [shown, setShown] = useState(false)

  const [activeAITab, setActiveAITab] = useState("ask")

  const { theme, setTheme } = useTheme()

  useEffect(() => {
    document.body.classList.toggle("plasmo-sidebar-show", shown)
    const githubTheme = document.documentElement.getAttribute("data-color-mode")
    setTheme(githubTheme === "dark" ? "dark" : "light")

    // close the sidebar when there is no code textarea
    const handleDetectCodeArea = () => {
      const codeArea = document.querySelector("#read-only-cursor-text-area")
      if (codeArea == null) {
        setShown(false)
      }
    }
    window.addEventListener("click", handleDetectCodeArea)

    return () => {
      window.removeEventListener("click", handleDetectCodeArea)
    }
  }, [shown, setTheme])

  return (
    <div id="plasmo-sidebar">
      <div>
        {!shown && (
          <Button
            id="expand-button"
            className="bg-foreground text-background"
            variant="outline"
            onClick={() => setShown(!shown)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> open
          </Button>
        )}
      </div>
      <div
        id="sidebar"
        className={`${
          shown ? "open" : "closed"
        } relative overflow-y-auto p-2 bg-background border border-gray-200 rounded-lg shadow ${
          theme === "dark" ? "dark" : "light"
        }`}>
        <div className="flex flex-col h-full">
          <div className="mb-2">
            <div className="flex mb-4">
              <Button
                className={"flex-1 px-4 py-2 text-foreground"}
                variant={activeAITab === "ask" ? "secondary" : "ghost"}
                onClick={() => setActiveAITab("ask")}>
                Ask AI
              </Button>
              <Button
                className={"flex-1 px-4 py-2 text-foreground"}
                variant={activeAITab === "search" ? "secondary" : "ghost"}
                onClick={() => setActiveAITab("search")}>
                Search with AI
              </Button>
            </div>
            {activeAITab === "ask" && <AskAiPanel />}
            {activeAITab === "search" && <SearchAIPanel />}
          </div>

          <div className="absolute right-4 top-4 flex">
            <Button
              className="p-2 fill-foreground"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setShown(false)
              }}>
              <Cross1Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
