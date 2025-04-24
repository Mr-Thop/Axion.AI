"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://axion-ai-dk6p.onrender.com"

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/`, {
          method: "GET",
          // Add a timeout to prevent long waiting times
          signal: AbortSignal.timeout(5000),
        })
        setStatus(response.ok ? "online" : "offline")
      } catch (error) {
        console.error("API check failed:", error)
        setStatus("offline")
      }
    }

    checkApiStatus()
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [apiUrl])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {status === "checking" && (
              <Badge variant="outline" className="animate-pulse">
                Checking API...
              </Badge>
            )}
            {status === "online" && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                API Online
              </Badge>
            )}
            {status === "offline" && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                API Offline
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status === "online"
            ? "The backend API is connected and working properly."
            : status === "offline"
              ? `Cannot connect to API at ${apiUrl}. Please check your backend server.`
              : "Checking API connection status..."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
