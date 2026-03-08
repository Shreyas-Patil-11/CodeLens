import os
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        # Must match the embedding model we used in rag_service.py exactly
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.persist_directory = "./chroma_db"
        
        # Initialize Groq LLM (llama3-8b-8192 is blazing fast and highly capable for coding tasks)
        # Initialize Groq LLM with the updated model name
        self.llm = ChatGroq(
            temperature=0, 
            model_name="llama-3.1-8b-instant", # <-- Updated line
        )
        
    def answer_question(self, question: str) -> dict:
        # 1. Connect to the existing vector database where our code is stored
        if not os.path.exists(self.persist_directory):
            return {"answer": "No repository has been ingested yet. Please ingest a repo first.", "sources": []}
            
        vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )
        
        # 2. Retrieve the top 5 most relevant code chunks based on the user's question
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        docs = retriever.invoke(question)
        
        # 3. Extract the actual code and the file paths (metadata)
        context = ""
        sources = set()
        
        for doc in docs:
            # We inject the file path directly into the context so the AI knows where the code came from
            context += f"\n\n--- File: {doc.metadata.get('source', 'Unknown')} ---\n"
            context += doc.page_content
            sources.add(doc.metadata.get('source', 'Unknown'))
            
        # 4. Construct the strict prompt for the LLM
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert software engineer and onboarding assistant. Answer the user's question about the codebase using ONLY the provided context. If the answer is not in the context, say 'I cannot find the answer in the ingested repository.' Always mention the file paths you used to formulate your answer."),
            ("human", "Context:\n{context}\n\nQuestion: {question}")
        ])
        
        # 5. Generate the answer
        chain = prompt | self.llm
        response = chain.invoke({"context": context, "question": question})
        
        return {
            "answer": response.content,
            "sources": list(sources)
        }