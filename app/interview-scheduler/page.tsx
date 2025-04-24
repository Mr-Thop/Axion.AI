"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function InterviewScheduler() {
  const [candidateName, setCandidateName] = useState("")
  const [candidateEmail, setCandidateEmail] = useState("")
  const [interviewer, setInterviewer] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string | undefined>(undefined)
  const [interviewMode, setInterviewMode] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [inputMode, setInputMode] = useState<"manual" | "csv">("manual")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [backendMessage, setBackendMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitted(false)

    const formData = new FormData()
    if (!date || !time || !interviewMode) {
      setError("Date, time, and mode are required.")
      return
    }

    formData.append("date", date.toISOString().split("T")[0])
    formData.append("time", time)
    formData.append("mode", interviewMode)
    formData.append("notes", notes)

    try {
      let res

      if (inputMode === "csv") {
        if (!file) {
          setError("Please upload a CSV file.")
          return
        }
        formData.append("file", file)
        res = await fetch("http://localhost:5000/api/schedule-interview", {
          method: "POST",
          body: formData,
        })
      } else {
        // Manual input
        const jsonBody = {
          candidateName,
          candidateEmail,
          interviewer,
          date: date.toISOString().split("T")[0],
          time,
          mode: interviewMode,
          notes,
        }
        res = await fetch("http://localhost:5000/api/schedule-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonBody),
        })
      }

      const result = await res.json()
      if (result.success) {
        setIsSubmitted(true)
        setBackendMessage(result.message || "Interview(s) scheduled successfully.")
      } else {
        setError(result.error || "Something went wrong.")
      }
    } catch (err) {
      setError("Server error. Please try again.")
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Interview Scheduler</h1>
        <p className="text-muted-foreground">
          Schedule interviews with candidates and manage your hiring pipeline.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSubmitted && backendMessage && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-500 mb-6">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{backendMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Input Mode</Label>
          <RadioGroup value={inputMode} onValueChange={(val) => setInputMode(val as "manual" | "csv")} required>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual">Manual Entry</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv">CSV Upload</Label>
            </div>
          </RadioGroup>
        </div>

        {inputMode === "manual" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name</Label>
              <Input id="candidate-name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidate-email">Candidate Email</Label>
              <Input id="candidate-email" type="email" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewer">Interviewer</Label>
              <Select onValueChange={setInterviewer} required>
                <SelectTrigger id="interviewer">
                  <SelectValue placeholder="Select interviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
                  <SelectItem value="alex-johnson">Alex Johnson</SelectItem>
                  <SelectItem value="sarah-williams">Sarah Williams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {inputMode === "csv" && (
          <div className="space-y-2">
            <Label htmlFor="csv-upload">Upload CSV File</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => {
                  const day = date.getDay()
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                  return day === 0 || day === 6 || isPast
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Time</Label>
          <Select value={time} onValueChange={setTime} required>
            <SelectTrigger id="time">
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Mode</Label>
          <RadioGroup value={interviewMode} onValueChange={setInterviewMode} required>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online">Online</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in-person" id="in-person" />
              <Label htmlFor="in-person">In-Person</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <Button type="submit" className="w-full">Schedule Interview</Button>
      </form>
    </div>
  )
}
