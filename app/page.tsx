import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar, FileSearch } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Home Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Axion AI
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Streamline your hiring process and document management with our intelligent automation platform
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/resume-analyzer">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Streamline. Automate. Accelerate.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-3">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <FileText className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4">Resume Analyzer</CardTitle>
                <CardDescription>Automatically analyze and rank resumes based on job requirements</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/resume-analyzer">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4">Interview Scheduler</CardTitle>
                <CardDescription>Easily schedule and manage interviews with candidates</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/interview-scheduler">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <FileSearch className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4">Document Analyzer</CardTitle>
                <CardDescription>Extract key insights from legal and business documents</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/document-analyzer">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Transform Your Workflow Today
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/resume-analyzer">Try It Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
