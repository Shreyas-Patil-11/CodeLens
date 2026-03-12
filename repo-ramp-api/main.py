
import os
import re
import shutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.rag_service import RAGService
from services.llm_service import LLMService
from services.dependency_service import DependencyService
from services.github_service import GitHubService
# NEW: Import your badass agent
from services.agent_service import CodebaseAgentService 

app = FastAPI(title="Repo-Ramp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = RAGService()
llm_service = LLMService()
dependency_service = DependencyService()
github_service = GitHubService()
agent_service = CodebaseAgentService() # Initialize the agent

class RepoRequest(BaseModel):
    repo_url: str

class QuestionRequest(BaseModel):
    question: str
    collection_name: str

class ArchitectureRequest(BaseModel):
    collection_name: str
    
class SearchRequest(BaseModel):
    query: str
    collection_name: str
    
class SummaryRequest(BaseModel):
    collection_name: str

def get_collection_name(repo_url: str) -> str:
    name = repo_url.split("/")[-1].replace(".git", "")
    name = re.sub(r'[^a-zA-Z0-9_-]', '-', name).strip('-')
    if len(name) < 3:
        name += "-repo"
    return name[:63]

@app.post("/api/ingest")
async def ingest_repository(request: RepoRequest):
    try:
        collection_name = get_collection_name(request.repo_url)
        
        # AGENT FIX: We must keep the files on disk so the Agent can read them later.
        repo_dir = os.path.join(".", "cloned_repos", collection_name)
        
        # If it already exists, clear it out for a fresh clone to prevent git conflicts
        if os.path.exists(repo_dir):
            shutil.rmtree(repo_dir)
        os.makedirs(repo_dir, exist_ok=True)
        
        # Clone permanently instead of to a temporary folder
        local_path = github_service.clone_repository(request.repo_url, repo_dir)
        
        chunk_count = rag_service.process_repository(local_path, collection_name)
        dependency_service.build_graph(local_path, collection_name)
            
        return {
            "status": "success", 
            "message": f"Successfully ingested {chunk_count} code chunks.",
            "collection_name": collection_name,
            "ready_for_chat": True 
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    try:
        # Reconstruct where the repo is saved on disk
        repo_dir = os.path.join(".", "cloned_repos", request.collection_name)
        
        # ROUTE TO THE AGENT INSTEAD OF THE STANDARD RAG
        response = agent_service.run_agent(request.question, request.collection_name, repo_dir)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
async def search_codebase(request: SearchRequest):
    try:
        return llm_service.semantic_search(request.query, request.collection_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/architecture")
async def get_architecture(request: ArchitectureRequest):
    try:
        response = llm_service.generate_architecture(request.collection_name)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summary")
async def get_summary(request: SummaryRequest):
    try:
        response = llm_service.generate_summary(request.collection_name)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dependencies/{collection_name}")
async def fetch_dependencies(collection_name: str):
    try:
        return dependency_service.get_graph(collection_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))