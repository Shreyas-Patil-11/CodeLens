# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from services.github_service import GithubService
# from services.rag_service import RAGService
# from dotenv import load_dotenv
# import uvicorn

# load_dotenv()

# app = FastAPI(title="Repo-Ramp API")
# github_service = GithubService()
# rag_service = RAGService()

# class RepoRequest(BaseModel):
#     repo_url: str

# @app.post("/api/ingest")
# async def ingest_repository(request: RepoRequest):
#     try:
#         # Step 1: Clone the repository
#         local_path = github_service.clone_repository(request.repo_url)
        
#         # Step 2: Parse, embed, and store in ChromaDB
#         chunk_count = rag_service.process_repository(local_path)
        
#         # Optional Step 3: Clean up the cloned files since they are now in the database
#         github_service.cleanup()
        
#         return {
#             "status": "success", 
#             "message": f"Successfully ingested {chunk_count} code chunks into the vector database.",
#             "ready_for_chat": True 
#         }
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.github_service import GithubService
from services.rag_service import RAGService
from services.llm_service import LLMService
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


load_dotenv()

app = FastAPI(title="Repo-Ramp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize our three core microservices
github_service = GithubService()
rag_service = RAGService()
llm_service = LLMService()

class RepoRequest(BaseModel):
    repo_url: str

class QuestionRequest(BaseModel):
    question: str

@app.post("/api/ingest")
async def ingest_repository(request: RepoRequest):
    try:
        local_path = github_service.clone_repository(request.repo_url)
        chunk_count = rag_service.process_repository(local_path)
        github_service.cleanup()
        
        return {
            "status": "success", 
            "message": f"Successfully ingested {chunk_count} code chunks into the vector database.",
            "ready_for_chat": True 
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    try:
        # Pass the user's question directly to our Groq-powered LLM service
        response = llm_service.answer_question(request.question)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)