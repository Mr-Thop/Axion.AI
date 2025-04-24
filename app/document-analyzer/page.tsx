"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FileUploader } from "@/components/file-uploader"
import { DocumentResults } from "@/components/document-results"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { analyzeDocumentAction, askDocumentQuestionAction } from "@/app/actions"

export default function DocumentAnalyzer() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create FormData to send to the server action
      const formData = new FormData()
      formData.append("file", files[0])

      // Call the server action
      const response = await analyzeDocumentAction(formData)

      if (response.success && response.data) {
        setResults(response.data)
        setActiveTab("results")
      } else {
        setError(response.error || "Failed to analyze document. Please try again.")
      }
    } catch (error) {
      console.error("Error analyzing document:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim() || !results) {
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // Call the server action to ask a question about the document
      const response = await askDocumentQuestionAction(results, searchQuery)

      if (response.success && response.data) {
        setSearchResult(response.data.answer)
      } else {
        setError(response.error || "Failed to search document. Please try again.")
      }
    } catch (error) {
      console.error("Error searching document:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Contracts/Documents Analyzer</h1>
        <p className="text-muted-foreground">
          Upload legal or business documents to extract key insights and analyze important clauses.
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
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>Upload legal or business documents for AI-powered analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Upload Document</Label>
                  <FileUploader accept=".pdf,.docx,.doc" maxFiles={1} onFilesChange={setFiles} />
                  {files.length > 0 && <p className="text-sm text-muted-foreground">{files[0].name} selected</p>}
                </div>

                <Button type="submit" disabled={isLoading || files.length === 0}>
                  {isLoading ? "Analyzing..." : "Analyze Document"}
                </Button>

                {isLoading && (
                  <div className="space-y-2">
                    <Progress value={60} className="h-2 w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      Analyzing document... This may take a moment.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Document Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium">Contracts</h3>
                  <p className="text-sm text-muted-foreground">NDAs, employment contracts, service agreements</p>
                </div>
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium">Legal Documents</h3>
                  <p className="text-sm text-muted-foreground">Terms of service, privacy policies, legal notices</p>
                </div>
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium">Business Documents</h3>
                  <p className="text-sm text-muted-foreground">Invoices, proposals, SLAs, reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {results && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>Document Search</CardTitle>
                    <CardDescription>Ask questions about the document</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="What is the penalty for service disruption?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                      {isSearching ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Searching...
                        </div>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </form>

                  {searchResult && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/50">
                      <h3 className="font-medium mb-2">Answer:</h3>
                      <p>{searchResult}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <DocumentResults result={results} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
