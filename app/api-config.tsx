"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ApiStatus = "checking" | "online" | "offline"

interface ApiContextType {
  status: ApiStatus
  apiUrl: string
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export function ApiProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ApiStatus>("checking")
  const apiUrl = "https://axion-ai-dk6p.onrender.com"

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(`${apiUrl}/`, {
          method: "GET",
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        setStatus(response.ok ? "online" : "offline")
      } catch (error) {
        console.error("API check failed:", error)
        setStatus("offline")
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000)

    return () => clearInterval(interval)
  }, [apiUrl])

  return <ApiContext.Provider value={{ status, apiUrl }}>{children}</ApiContext.Provider>
}

export function useApi() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider")
  }
  return context
}
