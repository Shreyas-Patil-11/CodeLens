
import os
import concurrent.futures
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

class RAGService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.base_dir = "./chroma_db"
        
        self.splitters = {
            Language.PYTHON: RecursiveCharacterTextSplitter.from_language(language=Language.PYTHON, chunk_size=1000, chunk_overlap=200),
            Language.JS: RecursiveCharacterTextSplitter.from_language(language=Language.JS, chunk_size=1000, chunk_overlap=200),
            Language.TS: RecursiveCharacterTextSplitter.from_language(language=Language.TS, chunk_size=1000, chunk_overlap=200),
            Language.CPP: RecursiveCharacterTextSplitter.from_language(language=Language.CPP, chunk_size=1000, chunk_overlap=200),
            Language.MARKDOWN: RecursiveCharacterTextSplitter.from_language(language=Language.MARKDOWN, chunk_size=1000, chunk_overlap=200),
            "default": RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        }
        
        self.ext_map = {
            ".py": Language.PYTHON, ".js": Language.JS, ".jsx": Language.JS,
            ".ts": Language.TS, ".tsx": Language.TS, ".cpp": Language.CPP,
            ".hpp": Language.CPP, ".md": Language.MARKDOWN
        }

    def _process_single_file(self, file_path: str, ext: str) -> list:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            doc = Document(page_content=content, metadata={"source": file_path})
            
            lang = self.ext_map.get(ext)
            if lang:
                chunks = self.splitters[lang].split_documents([doc])
            else:
                chunks = self.splitters["default"].split_documents([doc])
                
            file_name = os.path.basename(file_path)
            for chunk in chunks:
                chunk.page_content = f"--- File Name: {file_name} ---\n\n{chunk.page_content}"
                
            return chunks
        except Exception:
            return [] 

    def process_repository(self, repo_path: str, collection_name: str) -> int:
        valid_extensions = set(self.ext_map.keys()) | {".json"}
        ignored_files = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}
        
        files_to_process = []
        for root, _, files in os.walk(repo_path):
            if ".git" in root or "node_modules" in root:
                continue
            for file in files:
                if file in ignored_files:
                    continue
                ext = os.path.splitext(file)[1]
                if ext in valid_extensions:
                    file_path = os.path.join(root, file)
                    files_to_process.append((file_path, ext))

        if not files_to_process:
            return 0

        split_docs = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_file = {
                executor.submit(self._process_single_file, path, ext): path 
                for path, ext in files_to_process
            }
            
            for future in concurrent.futures.as_completed(future_to_file):
                chunks = future.result()
                if chunks:
                    split_docs.extend(chunks)

        if not split_docs:
            return 0

        # FIX: Create a physically separate directory for this collection
        persist_dir = os.path.join(self.base_dir, collection_name)
        
        vectorstore = Chroma.from_documents(
            documents=split_docs,
            embedding=self.embeddings,
            persist_directory=persist_dir,
            collection_name=collection_name 
        )
        
        return len(split_docs)