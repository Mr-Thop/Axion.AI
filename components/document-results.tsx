import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Share2, AlertTriangle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface DocumentResultsProps {
  result: {
    docType?: string
    DocType?: string
    summary?: string
    output?: {
      summary?: string
      key_clauses?: Record<string, string>
      risk_flagged?: string[]
      document_classification?: string
    }
    key_clauses?: Record<string, string>
    risk_flagged?: string[]
    document_classification?: string
  }
}

export function DocumentResults({ result }: DocumentResultsProps) {
  // Handle different API response formats
  const docType = result.docType || result.DocType || "Document"
  const summary = result.summary || result.output?.summary || ""
  const keyClauses = result.key_clauses || result.output?.key_clauses || {}
  const riskFlagged = result.risk_flagged || result.output?.risk_flagged || []
  const docClassification = result.document_classification || result.output?.document_classification || "Document"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{docType}</h2>
            <Badge>{docClassification}</Badge>
          </div>
          <p className="text-muted-foreground">Document Analysis Results</p>
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
            <CardTitle>Document Summary</CardTitle>
            <CardDescription>AI-generated summary of the document</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{summary}</p>
          </CardContent>
        </Card>

        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle>Key Clauses</CardTitle>
            <CardDescription>Important clauses extracted from the document</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(keyClauses).map(([key, value], index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="capitalize">{key.replace(/_/g, " ")}</AccordionTrigger>
                  <AccordionContent>{value}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>Risk Analysis</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <CardDescription>Potential issues or vague clauses</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {riskFlagged.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>AI-generated recommendations based on document analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Legal Considerations</h3>
              <p className="text-sm text-muted-foreground">
                Consider adding a cap on penalties to limit financial exposure. The current clause allows for unlimited
                penalties which could pose a significant risk.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Clarity Improvements</h3>
              <p className="text-sm text-muted-foreground">
                The definition of 'service degradation' should be clarified with specific metrics and thresholds to
                avoid potential disputes.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Missing Elements</h3>
              <p className="text-sm text-muted-foreground">
                Add a dispute resolution mechanism to establish a clear process for handling disagreements related to
                service levels and penalties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
