import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CompareResumesProps {
  resumes: Array<{
    name: string
    score: number
    skills: string[]
    education: string
    experience: string
    insights: string
  }>
}

export function CompareResumes({ resumes }: CompareResumesProps) {
  // Sort resumes by score (highest first)
  const sortedResumes = [...resumes].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Candidate</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Skills</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResumes.map((resume, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{resume.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              resume.score >= 80 ? "bg-green-500" : resume.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${resume.score}%` }}
                          />
                        </div>
                        <span className="font-medium">{resume.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{resume.education}</TableCell>
                    <TableCell>{resume.experience}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {resume.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resume.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedResumes.map((resume, index) => (
          <Card key={index} className={index === 0 ? "border-green-500 dark:border-green-500" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{resume.name}</CardTitle>
                {index === 0 && <Badge className="bg-green-500 hover:bg-green-600">Top Match</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Match Score</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        resume.score >= 80 ? "bg-green-500" : resume.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${resume.score}%` }}
                    />
                  </div>
                  <span className="font-medium">{resume.score}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Key Strengths</p>
                <p className="text-sm">{resume.insights.split(".")[0]}.</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {resume.skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
