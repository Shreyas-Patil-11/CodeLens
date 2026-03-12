import os
import json
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_tool_calling_agent
from dotenv import load_dotenv

load_dotenv()

class CodebaseAgentService:
    def __init__(self):
        self.base_dir = "./chroma_db"
        self.dependency_dir = "./dependency_graphs"
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        # We use a slightly higher temperature (0.1) so the agent has a tiny bit of creative flexibility in its reasoning
        self.llm = ChatGroq(temperature=0.1, model_name="llama-3.1-8b-instant")

    def run_agent(self, question: str, collection_name: str, repo_path: str) -> dict:
        persist_dir = os.path.join(self.base_dir, collection_name)
        
        # ---------------------------------------------------------
        # 1. DEFINE THE AGENT'S TOOLS (Its "Hands")
        # ---------------------------------------------------------
        
        @tool
        def semantic_search(query: str) -> str:
            """Use this tool to search the codebase for concepts, functions, or variable names. 
            It returns matching code snippets. Use this first when you don't know exactly which file to look at."""
            if not os.path.exists(persist_dir):
                return "Error: Database not found."
            
            vectorstore = Chroma(
                persist_directory=persist_dir,
                embedding_function=self.embeddings,
                collection_name=collection_name 
            )
            docs = vectorstore.similarity_search(query, k=5)
            
            result = ""
            for doc in docs:
                result += f"\n--- File: {doc.metadata.get('source', 'Unknown')} ---\n{doc.page_content}\n"
            return result

        @tool
        def read_entire_file(file_path: str) -> str:
            """Use this tool to read the complete, raw text of a specific file. 
            Only use this if you already know the exact file_path from a previous search and need full context."""
            # Ensure the path is relative to the repo to prevent directory traversal attacks
            safe_path = os.path.normpath(file_path).lstrip('/')
            full_path = os.path.join(repo_path, safe_path)
            
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception as e:
                return f"Error reading file: {str(e)}"

        @tool
        def get_file_dependencies(file_path: str) -> str:
            """Use this tool to find out what files import this file, or what this file imports.
            Pass the relative file path to see its connections."""
            try:
                graph_path = os.path.join(self.dependency_dir, f"{collection_name}.json")
                with open(graph_path, "r") as f:
                    graph = json.load(f)
                
                connections = []
                for edge in graph.get("edges", []):
                    if edge["source"] == file_path:
                        connections.append(f"This file imports: {edge['target']}")
                    elif edge["target"] == file_path:
                        connections.append(f"This file is imported by: {edge['source']}")
                        
                if not connections:
                    return "No dependencies found for this file."
                return "\n".join(connections)
            except Exception:
                return "Error reading dependency graph."

        tools = [semantic_search, read_entire_file, get_file_dependencies]

        # ---------------------------------------------------------
        # 2. DEFINE THE AGENT'S BRAIN (The Prompt)
        # ---------------------------------------------------------
        
        # ---------------------------------------------------------
        # 2. DEFINE THE AGENT'S BRAIN (The Prompt)
        # ---------------------------------------------------------
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an elite Autonomous Software Engineering Agent. 
            Your job is to answer the user's question about the codebase by executing tools to gather information.
            
            WORKFLOW RULES:
            1. PLAN: Always think step-by-step about what information you need.
            2. ACT: Use 'semantic_search' to find relevant files.
            3. OBSERVE: If you need more context, use 'read_entire_file'. 
               CRITICAL: You MUST ONLY pass exact file paths returned in the '--- File: <path> ---' headers from your semantic_search results. NEVER invent, guess, or use placeholder paths like '/path/to/...'.
            4. If asked about architecture or connections, use 'get_file_dependencies' using the exact relative path.
            5. Never guess or hallucinate code. If you cannot find the answer using your tools, say so.
            """),
            ("human", "{input}"),
            # This placeholder is the "scratchpad" where the agent remembers its previous tool calls
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        # ---------------------------------------------------------
        # 3. INITIALIZE THE LOOP
        # ---------------------------------------------------------
        
        # Bind the tools to Llama 3.1
        agent = create_tool_calling_agent(self.llm, tools, prompt)
        
        # The AgentExecutor manages the while-loop of Thought -> Action -> Observation
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=5)
        
        try:
            # Kick off the autonomous loop!
            response = agent_executor.invoke({"input": question})
            return {
                "answer": response["output"],
                "sources": [] # The agent will naturally mention the files in its markdown output
            }
        except Exception as e:
            return {"answer": f"The agent encountered a critical error while reasoning: {str(e)}", "sources": []}