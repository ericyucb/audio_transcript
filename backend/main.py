from typing import Union
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import uvicorn
import requests
import os
import json
import base64
import uuid
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get environment configuration
API_KEY = os.getenv("ELVELLABS_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Initialize FastAPI app
app = FastAPI()

# Create directory for storing generated PDFs
PDF_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pdfs")
os.makedirs(PDF_DIR, exist_ok=True)

# Add CORS middleware with appropriate configuration based on environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # print("file", file)
    content = await file.read()
    print("transcribing file")
    print("content type", type(content))

    base_url = "https://api.elevenlabs.io/v1/speech-to-text"
    
    api_key = API_KEY  

        
    print(f"API Key available: {bool(api_key)}")
    
    headers = {
        "accept": "application/json",
        "xi-api-key": api_key
    }
    
    files = {"file": (file.filename, content, file.content_type)}
    
    
  
    # Include additional formats parameters in form data
    form_data = {
        "model_id": "scribe_v1",
        "num_speakers": "2",
        "diarize": "true",
        "output_format": "text", 
        "tag_audio_events": "false",
        "additional_formats": '[{"format": "pdf"}]'
    }
    
    print("Sending request with form data:", form_data)
    print("Using file:", file.filename)
    
    # Send POST request with files and form data
    try:
        response = requests.post(base_url, headers=headers, files=files, data=form_data)
        print("Response status code:", response.status_code)
        
        # Print the full response for debugging
        # print("Full response:", response.text)

    except Exception as e:
        print("Error from ElevenLabs:", e)
        return {"error": str(e)}
    
    if response.status_code == 200:
        try:
            response_data = response.json()
            transcript = to_transcript(response_data.get("words", []))

            transcript_text = ""

            for segment in transcript:
                transcript_text += segment["speaker_id"] + ": " + segment["full_text"] + "\n"

            print("transcript_text", transcript_text)
            

           
         
            
            return {
                "filename": file.filename,
                "text": response_data.get("text", ""),
                "language": response_data.get("language", ""),
                "transcription": transcript_text
            }
        except Exception as e:
            print("Error parsing response:", e)
            return {"error": f"Error parsing response: {str(e)}"}
        
    else:
        error_detail = "Unknown error"
        try:
            error_detail = response.json()
        except:
            error_detail = response.text
        
        print("Error from ElevenLabs:", error_detail)
        return {"error": f"Error from ElevenLabs: {error_detail}"}

def to_transcript(data):
    if not data:
        return []

    transcript = []
    current_speaker = None
    segment = None

    for word in data:
        speaker = word["speaker_id"]

        # Start a new segment if the speaker changes
        if speaker != current_speaker:
            if segment:
                transcript.append(segment)
            segment = {
                "speaker_id": speaker,
                "start": word["start"],
                "full_text": ""
            }
            current_speaker = speaker

        segment["full_text"] += word["text"]

    if segment:
        transcript.append(segment)

    return transcript

    
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
