import { fetchModelInfos } from "@/lib/api-service"
import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface ModelConfig {
  name: string
  id: string
  prompt: string
}

interface ModelConfigContextType {
  ModelConfig: ModelConfig | null
  statusMessage: string
  setModelConfig: React.Dispatch<React.SetStateAction<ModelConfig | null>>
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>
}

const ModelConfigContext = createContext<ModelConfigContextType | undefined>(
  undefined
)

export const ModelConfigProvider = ({ children }: { children: ReactNode }) => {
  const [ModelConfig, setModelConfig] = useState<ModelConfig | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const response = await fetchModelInfos()
        setModelConfig({
          id: response.id,
          prompt: response.prompt,
          name: response.modelInfo.name
        })
        setStatusMessage("")
      } catch (error) {
        console.error("Error fetching model infos:", error)
        setStatusMessage("Failed to fetch model info.")
      }
    }

    fetchModelInfo()
  }, [])

  return (
    <ModelConfigContext.Provider
      value={{
        ModelConfig,
        statusMessage,
        setModelConfig,
        setStatusMessage
      }}>
      {children}
    </ModelConfigContext.Provider>
  )
}

export const useModelConfig = () => {
  const context = useContext(ModelConfigContext)
  if (!context) {
    throw new Error("useModelConfig must be used within a ModelConfigProvider")
  }
  return context
}
