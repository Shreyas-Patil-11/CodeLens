
import os
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import re

load_dotenv()

class LLMService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.base_dir = "./chroma_db"
        self.llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant")
        
    def answer_question(self, question: str, collection_name: str) -> dict:
        persist_dir = os.path.join(self.base_dir, collection_name)
        if not os.path.exists(persist_dir):
            return {"answer": "No repository has been ingested yet. Please ingest a repo first.", "sources": []}
            
        vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings,
            collection_name=collection_name 
        )
        
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        docs = retriever.invoke(question)
        
        context = ""
        sources = set()
        
        for doc in docs:
            context += f"\n\n--- File: {doc.metadata.get('source', 'Unknown')} ---\n"
            context += doc.page_content
            sources.add(doc.metadata.get('source', 'Unknown'))
            
        # FIX: Hard limit on context size to prevent LLM token explosion
        max_chars = 12000 
        if len(context) > max_chars:
            context = context[:max_chars] + "\n\n...[Context Truncated for Size]..."
            
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert software engineer and onboarding assistant. Answer the user's question about the codebase using ONLY the provided context. If the answer is not in the context, say 'I cannot find the answer in the ingested repository.' Always mention the file paths you used to formulate your answer."),
            ("human", "Context:\n{context}\n\nQuestion: {question}")
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({"context": context, "question": question})
        
        return {
            "answer": response.content,
            "sources": list(sources)
        }

    def generate_architecture(self, collection_name: str) -> dict:
        persist_dir = os.path.join(self.base_dir, collection_name)
        if not os.path.exists(persist_dir):
            return {"answer": "No repository has been ingested yet.", "sources": []}
            
        vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings,
            collection_name=collection_name 
        )
        
        db_data = vectorstore.get()
        metadatas = db_data.get("metadatas", [])
        
        sources = set()
        for m in metadatas:
            if m and "source" in m:
                parts = m["source"].split(os.sep)
                clean_path = "/".join(parts[-3:]) if len(parts) >= 3 else m["source"]
                clean_path = clean_path.replace("[", "(").replace("]", ")")
                sources.add(clean_path)
                
        tree_structure = "\n".join(list(sources))
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert software architect. Analyze the provided list of files. 
            Generate a high-level system architecture flowchart using Mermaid.js syntax. 
            
            CRITICAL RULES FOR MERMAID SYNTAX:
            1. Start exactly with 'graph TD'.
            2. Node IDs MUST be simple alphanumeric strings (e.g., A, B, N1, N2). Never use slashes or dots in the ID.
            3. File paths MUST be wrapped in brackets and double quotes (e.g., N1["app/dashboard/page.jsx"]).
            4. Use ONLY standard arrows (-->). NEVER use custom arrowheads like |> or ->>. If you add a label, use exact syntax: A -->|label| B
            5. Output ONLY valid Mermaid code wrapped in a ```mermaid codeblock. No introductory or concluding text."""),
            ("human", f"Repository Files:\n{tree_structure}")
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({})
        
        # # --- THE IRONCLAD SANITIZER ---
        # # We intercept the AI's output and forcefully correct known hallucinations
        # safe_mermaid = response.content
        
        # # Fix the exact error you are seeing: -->|JSX|> becomes -->|JSX|
        # safe_mermaid = safe_mermaid.replace("|>", "|")
        
        # # Catch other common LLM arrow hallucinations just in case
        # safe_mermaid = safe_mermaid.replace("->>", "-->")
        # safe_mermaid = safe_mermaid.replace("=>", "-->")
        
        # return {
        #     "answer": safe_mermaid,
        #     "sources": []
        # }
        
        # --- THE IRONCLAD SANITIZER ---
        safe_mermaid = response.content
        
        # 1. Fix hallucinated arrowheads
        safe_mermaid = safe_mermaid.replace("|>", "|")
        safe_mermaid = safe_mermaid.replace("->>", "-->")
        safe_mermaid = safe_mermaid.replace("=>", "-->")
        
        # 2. Fix EOF errors, stray Markdown lists (like "1. A --> B"), and bullets
        lines = safe_mermaid.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Strip leading and trailing whitespace
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
                
            # Nuke LLM-hallucinated numbered lists (e.g., "1. ", "142. ")
            line = re.sub(r'^\d+\.\s*', '', line)
            
            # Nuke markdown bullets (e.g., "- ", "* ")
            if line.startswith('- ') or line.startswith('* '):
                line = line[2:]
                
            # Skip lines that end with a dangling arrow to prevent EOF crashes
            if re.search(r'-->\s*$', line):
                continue
                
            cleaned_lines.append(line)
            
        safe_mermaid = '\n'.join(cleaned_lines)
        
        return {
            "answer": safe_mermaid,
            "sources": []
        }

    def semantic_search(self, query: str, collection_name: str, top_k: int = 5) -> dict:
        persist_dir = os.path.join(self.base_dir, collection_name)
        if not os.path.exists(persist_dir):
            return {"results": []}
            
        vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings,
            collection_name=collection_name 
        )
        
        # Perform a pure semantic similarity search (No LLM required = Lightning Fast)
        docs = vectorstore.similarity_search(query, k=top_k)
        
        results = []
        for doc in docs:
            # Clean up the injected file name tag we added during ingestion
            content = doc.page_content
            file_name_marker = "--- File Name:"
            if file_name_marker in content:
                # Split at the first double newline to separate our injected header from the actual code
                parts = content.split("\n\n", 1)
                if len(parts) > 1:
                    content = parts[1]
                    
            results.append({
                "file_path": doc.metadata.get("source", "Unknown"),
                "snippet": content
            })
            
        return {"results": results}
    
    def generate_summary(self, collection_name: str) -> dict:
        persist_dir = os.path.join(self.base_dir, collection_name)
        if not os.path.exists(persist_dir):
            return {"answer": "No repository has been ingested yet.", "sources": []}
            
        vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings,
            collection_name=collection_name 
        )
        
        # 1. Fetch the file tree
        db_data = vectorstore.get()
        metadatas = db_data.get("metadatas", [])
        
        sources = set()
        for m in metadatas:
            if m and "source" in m:
                parts = m["source"].split(os.sep)
                # Grab a slightly deeper path so the LLM can see folder structures (e.g., app/api/auth)
                clean_path = "/".join(parts[-4:]) if len(parts) >= 4 else m["source"]
                sources.add(clean_path)
                
        tree_structure = "\n".join(sorted(list(sources)))
        
        # 2. Prompt the LLM to act as a Principal Engineer
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert Principal Software Engineer reviewing a newly cloned repository. 
            Based on the provided file structure, generate a comprehensive Codebase Summary in clean, highly readable Markdown.
            
            You MUST include these exact sections:
            ### 🛠️ Tech Stack
            Identify primary languages, frameworks, and tools (infer from extensions and config files like package.json, requirements.txt, etc.).
            
            ### 🏛️ Architecture Style
            Describe the likely architectural pattern (e.g., Next.js App Router, MVC, Microservices, Monolith, Frontend SPA).
            
            ### 📦 Main Modules
            List the core directories and briefly explain what domain logic they likely handle.
            
            ### 🚪 Key Entry Points
            List the files where the application starts or where core routing happens (e.g., index.js, main.py, App.jsx, layout.tsx).
            """),
            ("human", f"Repository File Tree:\n{tree_structure}")
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({})
        
        return {
            "answer": response.content,
            "sources": []
        }