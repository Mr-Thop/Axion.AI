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


client = Groq(api_key=os.getenv("api_key"))

SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT")
SYSTEM_PROMPT_R = os.getenv("SYSTEM_PROMPT_R")

SYSTEM_PROMPT_ASK = os.getenv("SYSTEM_PROMPT_ASK")

SYSTEM = os.getenv("SYSTEM")

SYSTEM_PROMPT_Summary = os.getenv("SYSTEM_PROMPT_Summary")


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
    job_data = json.loads(job_response.choices[0].message.content)["output"]

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
    return "Axion AI API is running"

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
                body=f"""Dear {data['candidateName']},

We are pleased to inform you that your interview for the {data['role']} position has been scheduled.

Date: {data['date']}
Time: {data['time']}
Mode: {data['mode']}
Interviewer: {data['interviewer']}
Notes: {data.get('notes', 'N/A')}

You will receive a Google Calendar invitation shortly with all the necessary details and a link to join, if applicable. Please ensure your availability for the scheduled time.

If you have any questions or need to reschedule, feel free to reach out.

Best regards,
{data['interviewer']}
"""
            )
            return jsonify({"success": True, "message": "Interview scheduled and email sent."})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
