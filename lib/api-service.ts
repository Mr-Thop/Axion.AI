// This file contains functions to interact with the Flask backend API

// Base URL for the API - in production, this would be your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

/**
 * Evaluates a resume against a job description
 */
export async function evaluateResume(formData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluate_resume`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header as it will be set automatically with the boundary for multipart/form-data
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error evaluating resume:", error)
    throw error
  }
}

/**
 * Analyzes a document (contract, legal document, etc.)
 */
export async function analyzeDocument(formData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize_doc`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error analyzing document:", error)
    throw error
  }
}

/**
 * Asks a question about an analyzed document
 */
export async function askDocumentQuestion(documentSummary: any, question: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ask_doc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: documentSummary,
        question,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error asking document question:", error)
    throw error
  }
}
