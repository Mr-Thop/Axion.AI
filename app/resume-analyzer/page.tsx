"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FileUploader } from "@/components/file-uploader"
import { ResumeResults } from "@/components/resume-results"
import { CompareResumes } from "@/components/compare-resumes"
import { evaluateResumeAction } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ResumeAnalyzer() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [analyzedResumes, setAnalyzedResumes] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0 || !jobDescription.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create FormData to send to the server action
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("prompt", `Looking for a ${jobTitle} with the following requirements: ${jobDescription}`)

      // Call the server action
      const response = await evaluateResumeAction(formData)

      if (response.success && response.data) {
        // Extract the relevant data from the API response
        const resultData = response.data

        // Format the data for our UI
        const formattedResult = {
          name: resultData.Name || "Candidate",
          score: Number.parseInt(
            resultData.output.match(/(\d+)\/10/) ? resultData.output.match(/(\d+)\/10/)[1] * 10 : "70",
          ),
          skills: resultData.Skills || ["React", "JavaScript", "Node.js"],
          education: resultData.Education || "Not specified",
          experience: resultData.Experience || "Not specified",
          insights: resultData.output || "No insights available",
        }

        setResults(formattedResult)
        setAnalyzedResumes((prev) => [...prev, formattedResult])
        setActiveTab("results")
      } else {
        setError(response.error || "Failed to analyze resume. Please try again.")
      }
    } catch (error) {
      console.error("Error analyzing resume:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer & Ranker</h1>
        <p className="text-muted-foreground">
          Upload resumes and get AI-powered insights and rankings based on your job requirements.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>
            Results
          </TabsTrigger>
          <TabsTrigger value="compare" disabled={analyzedResumes.length < 2}>
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Enter the job description to match candidates against your requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea
                    id="job-description"
                    placeholder="Enter detailed job description and requirements..."
                    className="min-h-[150px]"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Resume</Label>
                  <FileUploader accept=".pdf" maxFiles={1} onFilesChange={setFiles} />
                  {files.length > 0 && <p className="text-sm text-muted-foreground">{files.length} file(s) selected</p>}
                </div>

                <Button type="submit" disabled={isLoading || files.length === 0 || !jobDescription.trim()}>
                  {isLoading ? "Analyzing..." : "Analyze Resume"}
                </Button>

                {isLoading && (
                  <div className="space-y-2">
                    <Progress value={45} className="h-2 w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      Analyzing resume... This may take a moment.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">{results && <ResumeResults result={results} />}</TabsContent>

        <TabsContent value="compare">
          {analyzedResumes.length >= 2 && <CompareResumes resumes={analyzedResumes} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
