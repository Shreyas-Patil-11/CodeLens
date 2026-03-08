# import os
# from langchain_core.documents import Document
# from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_community.vectorstores import Chroma

# class RAGService:
#     def __init__(self):
#         # We use a fast, free local embedding model
#         self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
#         # This is where our database will save to disk
#         self.persist_directory = "./chroma_db"
        
#     def process_repository(self, repo_path: str) -> int:
#         documents = []
        
#         # 1. Added .json and .md so the AI can read package.json and READMEs
#         valid_extensions = {".py", ".js", ".jsx", ".ts", ".tsx", ".cpp", ".hpp", ".json", ".md"}
        
#         for root, _, files in os.walk(repo_path):
#             if ".git" in root or "node_modules" in root: # Skip node_modules too!
#                 continue
                
#             for file in files:
#                 ext = os.path.splitext(file)[1]
#                 if ext in valid_extensions:
#                     file_path = os.path.join(root, file)
#                     try:
#                         with open(file_path, "r", encoding="utf-8") as f:
#                             content = f.read()
#                             documents.append(
#                                 Document(page_content=content, metadata={"source": file_path})
#                             )
#                     except Exception:
#                         pass 

#         # 2. Changed to a standard text splitter so it handles JS, JSON, and Python equally well
#         text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=1000,
#             chunk_overlap=200
#         )
        
#         split_docs = text_splitter.split_documents(documents)

#         # 3. Store in ChromaDB
#         vectorstore = Chroma.from_documents(
#             documents=split_docs,
#             embedding=self.embeddings,
#             persist_directory=self.persist_directory
#         )
        
#         return len(split_docs)
        
        
import os
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

class RAGService:
    def __init__(self):
        # We use a fast, free local embedding model
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.persist_directory = "./chroma_db"
        
    def process_repository(self, repo_path: str) -> int:
        documents = []
        
        valid_extensions = {".py", ".js", ".jsx", ".ts", ".tsx", ".cpp", ".hpp", ".json", ".md"}
        
        # EXCLUSION LIST: Block massive auto-generated files from blinding the AI
        ignored_files = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}
        
        for root, _, files in os.walk(repo_path):
            if ".git" in root or "node_modules" in root:
                continue
                
            for file in files:
                # Skip the noise files
                if file in ignored_files:
                    continue
                    
                ext = os.path.splitext(file)[1]
                if ext in valid_extensions:
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            documents.append(
                                Document(page_content=content, metadata={"source": file_path})
                            )
                    except Exception:
                        pass 

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        split_docs = text_splitter.split_documents(documents)

        vectorstore = Chroma.from_documents(
            documents=split_docs,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        
        return len(split_docs)