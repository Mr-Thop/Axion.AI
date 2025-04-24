import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ApiErrorProps {
  message: string
}

export function ApiError({ message }: ApiErrorProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
