

# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from services.github_service import GithubService
# from services.rag_service import RAGService
# from services.llm_service import LLMService
# from dotenv import load_dotenv
# from fastapi.middleware.cors import CORSMiddleware
# from services.dependency_service import DependencyService
# import re
# import uvicorn


# load_dotenv()
# dependency_service = DependencyService()

# app = FastAPI(title="Repo-Ramp API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Initialize our three core microservices
# github_service = GithubService()
# rag_service = RAGService()
# llm_service = LLMService()

# class RepoRequest(BaseModel):
#     repo_url: str

# class QuestionRequest(BaseModel):
#     question: str
#     collection_name: str
    
# # Utility to convert "https://github.com/user/ai-interview.git" to "ai-interview"
# def get_collection_name(repo_url: str) -> str:
#     name = repo_url.split("/")[-1].replace(".git", "")
#     # Chroma requires alphanumeric names between 3-63 characters
#     name = re.sub(r'[^a-zA-Z0-9_-]', '-', name)
#     name = name.strip('-')
#     if len(name) < 3:
#         name += "-repo"
#     return name[:63]

# # @app.post("/api/ingest")
# # async def ingest_repository(request: RepoRequest):
# #     try:
# #         collection_name = get_collection_name(request.repo_url)
# #         local_path = github_service.clone_repository(request.repo_url)
        
# #         # Pass the isolated collection name to the RAG service
# #         chunk_count = rag_service.process_repository(local_path, collection_name)
# #         github_service.cleanup()
        
# #         return {
# #             "status": "success", 
# #             "message": f"Successfully ingested {chunk_count} code chunks.",
# #             "collection_name": collection_name, # <-- Return this so the frontend can save it
# #             "ready_for_chat": True 
# #         }
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))

# @app.post("/api/ingest")
# async def ingest_repository(request: RepoRequest):
#     try:
#         collection_name = get_collection_name(request.repo_url)
#         local_path = github_service.clone_repository(request.repo_url)
        
#         chunk_count = rag_service.process_repository(local_path, collection_name)
        
#         # NEW: Build the dependency graph before cleaning up!
#         dependency_service.build_graph(local_path, collection_name)
        
#         github_service.cleanup()
        
#         return {
#             "status": "success", 
#             "message": f"Successfully ingested {chunk_count} code chunks.",
#             "collection_name": collection_name,
#             "ready_for_chat": True 
#         }
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @app.post("/api/ask")
# async def ask_question(request: QuestionRequest):
#     try:
#         # Pass the collection name to the LLM service
#         response = llm_service.answer_question(request.question, request.collection_name)
#         return response
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
# class ArchitectureRequest(BaseModel):
#     collection_name: str

# @app.post("/api/architecture")
# async def get_architecture(request: ArchitectureRequest):
#     try:
#         response = llm_service.generate_architecture(request.collection_name)
#         return response
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
    


# # 4. Add this brand new route at the bottom of the file
# @app.get("/api/dependencies/{collection_name}")
# async def fetch_dependencies(collection_name: str):
#     try:
#         graph = dependency_service.get_graph(collection_name)
#         return graph
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

import re
import tempfile
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.rag_service import RAGService
from services.llm_service import LLMService
from services.dependency_service import DependencyService
# Ensure your GitHub service is imported correctly here
from services.github_service import GitHubService 

app = FastAPI(title="Repo-Ramp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = RAGService()
llm_service = LLMService()
dependency_service = DependencyService()
github_service = GitHubService()

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
        
        # FIX: The context manager ensures the temp folder is nuked even if the app crashes
        with tempfile.TemporaryDirectory() as tmp_dir:
            # Tell your github_service to clone into tmp_dir
            local_path = github_service.clone_repository(request.repo_url, tmp_dir)
            
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
        response = llm_service.answer_question(request.question, request.collection_name)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/architecture")
async def get_architecture(request: ArchitectureRequest):
    try:
        response = llm_service.generate_architecture(request.collection_name)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dependencies/{collection_name}")
async def fetch_dependencies(collection_name: str):
    try:
        return dependency_service.get_graph(collection_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/search")
async def search_codebase(request: SearchRequest):
    try:
        return llm_service.semantic_search(request.query, request.collection_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/summary")
async def get_summary(request: SummaryRequest):
    try:
        response = llm_service.generate_summary(request.collection_name)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))