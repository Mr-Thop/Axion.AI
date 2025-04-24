"use server"

import { evaluateResume, analyzeDocument, askDocumentQuestion } from "@/lib/api-service"

/**
 * Server action to evaluate a resume
 */
export async function evaluateResumeAction(formData: FormData) {
  try {
    // Pass the form data directly to the API service
    const result = await evaluateResume(formData)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in evaluateResumeAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

/**
 * Server action to analyze a document
 */
export async function analyzeDocumentAction(formData: FormData) {
  try {
    const result = await analyzeDocument(formData)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in analyzeDocumentAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

/**
 * Server action to ask a question about a document
 */
export async function askDocumentQuestionAction(documentSummary: any, question: string) {
  try {
    const result = await askDocumentQuestion(documentSummary, question)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in askDocumentQuestionAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
