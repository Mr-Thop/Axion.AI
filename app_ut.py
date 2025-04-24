from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import pytz, base64
import os
from pypdf import PdfReader

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import pandas as pd

app = Flask(__name__)
CORS(app)

SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.send'
]

GOOGLE_TIMEZONE = 'Asia/Kolkata'
CALENDAR_ID = 'primary'


client = Groq(api_key="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")

SYSTEM_PROMPT = '''
You are an AI Assistant with Start , input ,plan , conversation adn Output State.
Wait for the User Prompt and first PLAN using the Input.
After Planning Take the appropriate Tools and wait for Observation based on action.
Once You get the Observation , return the AI Response Based on the Start Prompt and Observations.

Prompt:
{"type" : "input" ,"Role" : "<Role Applied>" ,"Name" : "<Candidates Name>" "Education" : <Candidates Education> , "Description" : <Candidates Description> , "Experience" : <Candidates Experience> ,"Projects" : <Candidates Project Description>,"Skills" : <Candidates Skills>,"Required Skills":"<Required Skills for the Openings>"}

Return Type : 
START
Example :
{"type": "system", "Role": "Software Developer", "Education": "B.Tech in Computer Science", "Description": "Akshay is a skilled full-stack developer with expertise in React and Node.js.", "Experience": "3 years in Full-Stack Development", "Projects": "Developed scalable web applications and contributed to open-source projects."}
{"type": "plan", "plan": "Evaluate whether Akshay is eligible for the Software Developer role."}
{"type": "conversation", "discussion": [
    {"panelist": "HR", "statement": "Akshay has a B.Tech in Computer Science. That’s relevant, but does he have experience?"},
    {"panelist": "Tech Lead", "statement": "He has 3 years of experience in Full-Stack Development. Does his project work align with our needs?"},
    {"panelist": "Project Manager", "statement": "He has worked on scalable web applications using React and Node.js, which matches our stack."},
    {"panelist": "HR", "statement": "That’s good, but does his profile show leadership or problem-solving skills?"},
    {"panelist": "Tech Lead", "statement": "He contributed to an open-source project and led a small team in his last job."},
    {"panelist": "Project Manager", "statement": "That sounds promising. I think he’s a strong candidate."}
]}
{"type": "output", "Name" : "Akshay" ,"output": "Akshay is a good fit for the Software Developer role , We Rate him 7/10 and should proceed to the next round."}


Return only One State at a Time in JSON Format only
'''

SYSTEM_PROMPT_R = '''
You are an AI Assistant with Start , input  and Output State.
Wait for the User Prompt and first PLAN using the Input.
Once You get the Observation , return the AI Response Based on the Start Prompt and Observations.

Prompt:
{
  "type": "input",
  "role": "<Applied Role>",
  "instruction": "You are an AI Assistant that parses unstructured resume data and converts it into a structured JSON format based on the role applied. The input is an unstructured text-based resume, and the output is a structured JSON representation.",
  "data": "<Unstructured Resume Text>",
  "Required Skills" : "<Required Skills for the OPENING>"
}
Return Type : 
"output_format": {
    "type": "output",
    "Role": "<Role from input>",
    "Name": "<Candidates Name>",
    "Education": "<Extracted Candidate's Education>",
    "Description": "<Brief Summary of Candidate>",
    "Experience": "<Extracted Candidate's Work Experience>",
    "Projects": "<Extracted Notable Projects Candidate Has Worked On>",
    "Skills": ["<Skill 1>", "<Skill 2>", "<Skill 3>", "..."],
    "Required Skills" : "<Required Skills for the OPENING>"
}


Example :
Input
{
  "role": "AI Engineer",
  "instruction": "You are an AI Assistant that parses unstructured resume data and converts it into a structured JSON format based on the role applied. The input is an unstructured text-based resume, and the output is a structured JSON representation.",
  "input_format": {
    "type": "input",
    "data": "John Doe is an AI Engineer with a strong background in machine learning and deep learning. He holds a Master's degree in Computer Science from MIT. John has 4 years of experience working at top AI research labs, where he developed computer vision models and optimized deep learning algorithms. His notable projects include building an AI-powered recommendation system and deploying NLP models for sentiment analysis. He is proficient in Python, TensorFlow, PyTorch, and cloud platforms like AWS and GCP.",
    "Required Skills" : "["Natural Language Processing",
      "Computer Vision",
      "Python",
      "TensorFlow",
      "PyTorch",
      "AWS"]"
}

Output{
    "type": "output",
    "Role": "AI Engineer",
    "Name" : "John Doe",
    "Education": "Master's in Computer Science from MIT",
    "Description": "John Doe is an AI Engineer with expertise in deep learning, computer vision, and NLP.",
    "Experience": "4 years of experience in AI research labs, working on deep learning optimization and computer vision models.",
    "Projects": [
      "Developed an AI-powered recommendation system",
      "Deployed NLP models for sentiment analysis"
    ],
    "Skills": [
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Python",
      "TensorFlow",
      "PyTorch",
      "AWS",
      "GCP",
      "Model Deployment"
    ],
    "Required Skills" : "["Natural Language Processing",
      "Computer Vision",
      "Python",
      "TensorFlow",
      "PyTorch",
      "AWS"]"
  }

Give me Output directly and no explanation and also Education and Experience also should be in string form , i.e in sentece forms only not lists or dictionary

Return in JSON Format only
'''

SYSTEM_PROMPT_ASK = '''
You are an AI Assistant with Start, Input, Plan, Conversation, and Output states.
You receive a previously generated Summary of a Document, and a follow-up User Question about it.
Your task is to analyze the Summary and produce a well-structured, human-readable answer.

Prompt:
{
  "type": "input",
  "summary": {
    "summary": "<Brief summary of document>",
    "key_clauses": {
      "penalty": "<Clause about penalties>",
      "uptime_commitment": "<Clause about uptime>",
      "support_terms": "<Clause about support>"
    },
    "risk_flagged": ["<List of identified risks>"],
    "document_classification": "<DocType - e.g., SLA, NDA, Invoice>"
  },
  "question": "<User's question about the document>"
}

Behavior:
- Carefully read and understand the summarized content.
- Use only the information from the summary and key clauses.
- Formulate a relevant and helpful answer to the user’s question.
- DOnt want any bold characters n all just give the output in a string form without any decoration.

Return Type:
START
Example:
{"type": "system", "summary": { ... }, "question": "What penalties apply if the service fails?"}
{"type": "plan", "plan": "Look into the penalty clause and determine the consequence of service failure."}
{"type": "conversation", "discussion": [
    {"analyst": "Question Interpreter", "statement": "User wants to know the penalty terms from the SLA."},
    {"analyst": "Summary Analyst", "statement": "Penalty clause says 5% of invoice per day of delay."},
    {"analyst": "Formatter", "statement": "Answer will be rendered in printable format for display."}
]}
{"type": "output", "answer": "
📄 Penalty Clause Overview:
If the service fails to meet uptime commitments, the provider is liable to pay a penalty of 5% of the invoice value for each day of delay.

This clause is clearly defined and enforceable.
"}

Return only one JSON object per step and only one type at a time.
Direct give the output state and Only starting with {

Return only in JSON format.
'''


SYSTEM = '''Analyze the job posting prompt provided by the user and extract key details to generate a structured JSON file. The JSON should include:

1. **job_role**: The specific job title or role mentioned in the prompt.
2. **job_skills**: A list of relevant skills required for the job, extracted from the description.
3. **description**: A concise summary of the job posting, retaining all essential details.

NOTE : If Not Provided Make Sure you Understand the Prompt and Not return a Empty String

Ensure the extracted information accurately represents the user's input. Return the output in a properly formatted JSON structure.

### Example Input:
"Looking for a skilled Data Scientist with expertise in Python, Machine Learning, and SQL. The ideal candidate should have experience working with large datasets and deploying predictive models."

### Expected Output:
{
    "type" : "output",
    "output" :{
    "job_role": "Data Scientist",
    "job_skills": ["Python", "Machine Learning", "SQL", "Data Analysis", "Predictive Modeling"],
    "description": "Hiring a Data Scientist proficient in Python, Machine Learning, and SQL. The role involves working with large datasets and deploying predictive models."
    }
}

Give me Output directly and no explanation

Return in JSON Format only
'''

SYSTEM_PROMPT_Summary = '''
You are an AI Assistant with Start, Input, Plan, Conversation, and Output states.
Wait for the User Prompt and first PLAN using the Input.
After Planning, take the appropriate Tools and wait for Observation based on action.
Once you get the Observation, return the AI Response based on the Start Prompt and Observations.

Prompt:
{"type" : "input", "DocType": "<Type of Document - e.g., NDA, SLA, Invoice or Unknown>", "Text": "<Extracted Text from OCR>"}

Behavior:
- Auto-classify the document type based on content.
- Summarize the document in concise language.
- Extract important clauses (e.g., penalties, terms, obligations, durations).
- Flag any vague, missing, or risky clauses (e.g., unclear penalties, undefined terms).
- Prepare insights for future question-answering.

Return Type:
START
Example:
{"type": "system", "DocType": "Unknown", "Text": "This agreement is made between..."}
{"type": "plan", "plan": "Classify the document type, summarize it, extract key clauses, and flag any potential issues."}
{"type": "conversation", "discussion": [
    {"analyst": "Classifier", "statement": "The document defines service levels, uptime commitments, and penalties — it appears to be an SLA."},
    {"analyst": "Summarizer", "statement": "Summarized key points around uptime, support, response times, and penalty enforcement."},
    {"analyst": "Clause Extractor", "statement": "Penalty clause states 5% of invoice per day of delay."},
    {"analyst": "Risk Checker", "statement": "The clause does not mention a cap, which could be risky. Also, no mention of dispute resolution."}
]}
{"type": "output", "DocType": "SLA", "output": {
    "summary": "This Service Level Agreement defines service uptime (99.9%), outlines support SLAs, and includes penalties for breaches.",
    "key_clauses": {
        "penalty": "5% of invoice per day of delay",
        "uptime_commitment": "99.9%",
        "support_terms": "24/7 support, 2-hour response time"
    },
    "risk_flagged": [
        "No upper limit on penalties",
        "No mention of dispute resolution mechanism"
    ],
    "document_classification": "SLA"
}}

Return One json output at a time , i.e 1 type at a time
Return One State at a Time Only and Dont need any explanation

Return the output in JSON Format only

'''

def extract_text_from_pdf(file):
    reader = PdfReader(file)
    return " ".join([page.extract_text() for page in reader.pages])

@app.route('/evaluate_resume', methods=['POST'])
def evaluate_resume():
    file = request.files['file']
    prompt = request.form.get('prompt')
    resume_text = extract_text_from_pdf(file)

    print("Resume Text:", resume_text)


    # Step 1: Extract job role and required skills
    job_response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt}
        ],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        max_completion_tokens=1024
    )
    job_data = json.loads(job_response.choices[0].message.content[3:-3])["output"]

    print("Response from Groq:", job_response.choices[0].message.content)
    print("Response Parsed:", job_data)


    # Step 2: Parse the resume based on the job role and skills
    resume_input = {
        "type": "input",
        "role": job_data["job_role"],
        "instruction": "You are an AI Assistant that parses unstructured resume data and converts it into a structured JSON format based on the role applied.",
        "data": resume_text,
        "Required Skills": job_data["job_skills"]
    }
    resume_response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_R},
            {"role": "user", "content": json.dumps(resume_input)}
        ],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        max_completion_tokens=1024
    )

    print("Resume_Response :  ",resume_response.choices[0].message.content)
    structured_resume = json.loads(resume_response.choices[0].message.content[resume_response.choices[0].message.content.find("{"):-3])

    # Step 3: Evaluate the parsed resume
    evaluation_input = {
        "type": "input",
        "role": job_data["job_role"],
        "Required_Skills": job_data["job_skills"],
        "resume": structured_resume
    }
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": json.dumps(evaluation_input)}
    ]
    json_plan = {}
    while json_plan.get("type") != "output":
        response = client.chat.completions.create(
            messages=messages,
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            max_completion_tokens=1024
        )
        json_plan = json.loads(response.choices[0].message.content[response.choices[0].message.content.find("{"):])
        messages.append({"role": "user", "content": json.dumps(json_plan)})

    json_plan["Skills"] = structured_resume["Skills"]
    json_plan["Education"] = structured_resume["Education"]
    json_plan["Experience"] = structured_resume["Experience"]
    print("Response from Groq:", json_plan)
    return jsonify(json_plan)

@app.route('/summarize_doc', methods=['POST'])
def summarize_doc():
    file = request.files['file']
    doc_text = extract_text_from_pdf(file)
    doc_data = {
        "type": "input",
        "Text": doc_text
    }
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_Summary},
        {"role": "user", "content": json.dumps(doc_data)}
    ]
    json_doc = {}
    max_retries = 3
    retries = 0
    
    while json_doc.get("type") != "output" and retries < max_retries:
        response = client.chat.completions.create(
            messages=messages,
            model="meta-llama/llama-4-scout-17b-16e-instruct",
        )
        content_part = response.choices[0].message.content
        
        # Improved JSON extraction with error handling
        start = content_part.find('{')
        end = content_part.rfind('}')  # Find last closing brace
        if start == -1 or end == -1:
            print("No JSON found in response")
            retries += 1
            continue
        
        json_str = content_part[start:end+1]  # Include the closing brace
        
        try:
            json_doc = json.loads(json_str)
            print("Parsed JSON:", json_doc)
        except json.JSONDecodeError as e:
            print(f"JSON parsing failed: {e}")
            # Add corrective feedback to messages
            messages.append({
                "role": "user", 
                "content": "ERROR: Your response must be valid JSON. Please reformat your response."
            })
            retries += 1
            continue
        
        # Check if we got the expected output type
        if json_doc.get("type") == "output":
            break
            
        messages.append({"role": "user", "content": json.dumps(json_doc)})
    
    if retries >= max_retries:
        return jsonify({"error": "Failed to generate valid summary after retries"}), 500
    
    return jsonify(json_doc)


@app.route('/ask_doc', methods=['POST'])
def ask_doc():
    content = request.json
    doc_summary = content['summary']
    question = content['question']
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_ASK},
        {"role": "assistant", "content": json.dumps(doc_summary)},
        {"role": "user", "content": question}
    ]
    response = client.chat.completions.create(
        messages=messages,
        model="meta-llama/llama-4-scout-17b-16e-instruct"
    )
    print(response.choices[0].message.content)
    return jsonify({"answer": json.loads(response.choices[0].message.content)["answer"]})

@app.route('/')
def home():
    return "Groq AI Resume/Doc Analysis API is running"

# Google Authentication
def get_credentials():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=8080)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

# Send email via Gmail API
def send_email(candidate_email, subject, body):
    creds = get_credentials()
    service = build('gmail', 'v1', credentials=creds)

    message = MIMEText(body)
    message['to'] = candidate_email
    message['subject'] = subject

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    message_body = {'raw': raw_message}

    service.users().messages().send(userId='me', body=message_body).execute()

# Add event to Google Calendar
def create_calendar_event(candidate_name, candidate_email, interviewer, date_str, time_str, mode, notes):
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)

    # Combine date and time
    naive_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %I:%M %p")
    tz = pytz.timezone('Asia/Kolkata')
    start = tz.localize(naive_dt)
    end = start + timedelta(minutes=30)

    event = {
        'summary': f'Interview with {candidate_name}',
        'description': f'Interview mode: {mode}\nInterviewer: {interviewer}\nNotes: {notes}',
        'start': {'dateTime': start.isoformat(), 'timeZone': 'Asia/Kolkata'},
        'end': {'dateTime': end.isoformat(), 'timeZone': 'Asia/Kolkata'},
        'attendees': [{'email': candidate_email}],
    }

    service.events().insert(calendarId='primary', body=event).execute()

@app.route("/api/schedule-interview", methods=["POST"])
def schedule_interview():
    if 'file' in request.files:
        # CSV Upload Mode
        file = request.files['file']
        if not file.filename.endswith('.csv'):
            return jsonify({"success": False, "error": "Only CSV files are supported."}), 400

        try:
            df = pd.read_csv(file)
            if 'Name' not in df.columns or 'Email' not in df.columns:
                return jsonify({"success": False, "error": "CSV must have 'Name' and 'Email' columns."}), 400

            results = []
            for _, row in df.iterrows():
                try:
                    create_calendar_event(
                        candidate_name=row['Name'],
                        candidate_email=row['Email'],
                        interviewer="Auto Assigned",
                        date_str=request.form['date'],
                        time_str=request.form['time'],
                        mode=request.form['mode'],
                        notes=request.form.get('notes', '')
                    )
                    send_email(
                        candidate_email=row['Email'],
                        subject="Interview Scheduled",
                        body=f"Hi {row['Name']},\n\nYour interview is scheduled on {request.form['date']} at {request.form['time']} ({request.form['mode']})."
                    )
                    results.append({"Name": row['Name'], "Email": row['Email'], "status": "Scheduled"})
                except Exception as e:
                    results.append({"Name": row['Name'], "Email": row['Email'], "status": "Failed", "error": str(e)})

            return jsonify({"success": True, "message": "Batch scheduling done", "results": results})

        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    else:
        # Single JSON Mode
        data = request.get_json()
        try:
            create_calendar_event(
                candidate_name=data['candidateName'],
                candidate_email=data['candidateEmail'],
                interviewer=data['interviewer'],
                date_str=data['date'],
                time_str=data['time'],
                mode=data['mode'],
                notes=data.get('notes', '')
            )
            send_email(
                candidate_email=data['candidateEmail'],
                subject=f"Interview Scheduled with {data['interviewer']}",
                body=f"""Hi {data['candidateName']},

Your interview has been scheduled.

📅 Date: {data['date']}
⏰ Time: {data['time']}
💬 Mode: {data['mode']}
👤 Interviewer: {data['interviewer']}
📝 Notes: {data.get('notes', 'N/A')}

You will receive a Google Calendar invite shortly.
"""
            )
            return jsonify({"success": True, "message": "Interview scheduled and email sent."})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
