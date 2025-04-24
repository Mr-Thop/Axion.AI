import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"

interface ResumeResultsProps {
  result: {
    name: string
    score: number
    skills: string[]
    education: string
    experience: string
    insights: string
  }
}

export function ResumeResults({ result }: ResumeResultsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{result.name}</h2>
          <p className="text-muted-foreground">Resume Analysis Results</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Match Score</p>
              <div className="flex items-center gap-2">
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <span className="font-bold">{result.score}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Education</p>
              <p>{result.education}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Experience</p>
              <p>{result.experience}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Detailed analysis of the candidate's profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{result.insights}</p>

            <div className="mt-6 space-y-4">
              <h4 className="font-medium">Strengths</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Strong technical background in required technologies</li>
                <li>Relevant industry experience</li>
                <li>Educational qualifications match job requirements</li>
              </ul>

              <h4 className="font-medium">Areas for Consideration</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>May need additional training in specific tools</li>
                <li>Consider evaluating communication skills during interview</li>
              </ul>

              <h4 className="font-medium">Recommended Next Steps</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Schedule technical interview</li>
                <li>Prepare specific questions about past projects</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
