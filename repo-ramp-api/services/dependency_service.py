# import os
# import re
# import json

# class DependencyService:
#     def __init__(self):
#         # We will save the mapped graphs here so they persist like ChromaDB
#         self.storage_dir = "./dependency_graphs"
#         os.makedirs(self.storage_dir, exist_ok=True)

#     def build_graph(self, repo_path: str, collection_name: str):
#         nodes = []
#         edges = []
#         node_ids = set()
        
#         # Regex to catch: import Something from './path/to/file'
#         import_pattern = re.compile(r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]')
        
#         for root, _, files in os.walk(repo_path):
#             if ".git" in root or "node_modules" in root:
#                 continue
                
#             for file in files:
#                 if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
#                     file_path = os.path.join(root, file)
#                     # Create a clean relative path to use as the Node ID
#                     rel_path = os.path.relpath(file_path, repo_path).replace("\\", "/")
                    
#                     if rel_path not in node_ids:
#                         nodes.append({"id": rel_path, "data": {"label": file}})
#                         node_ids.add(rel_path)
                    
#                     try:
#                         with open(file_path, "r", encoding="utf-8") as f:
#                             content = f.read()
#                             imports = import_pattern.findall(content)
                            
#                             for imp in imports:
#                                 # Only map internal project files, ignore external npm packages like 'react'
#                                 if imp.startswith('.'):
#                                     # Clean up the import string for display
#                                     target_name = imp.split('/')[-1] 
#                                     target_id = f"virtual_{target_name}" # Virtual node for the imported file
                                    
#                                     if target_id not in node_ids:
#                                         nodes.append({"id": target_id, "data": {"label": target_name}})
#                                         node_ids.add(target_id)
                                        
#                                     edges.append({
#                                         "id": f"{rel_path}-{target_id}", 
#                                         "source": rel_path, 
#                                         "target": target_id,
#                                         "animated": True # Makes the connecting line visually flow!
#                                     })
#                     except Exception:
#                         pass
        
#         graph_data = {"nodes": nodes, "edges": edges}
        
#         # Save to disk
#         with open(os.path.join(self.storage_dir, f"{collection_name}.json"), "w") as f:
#             json.dump(graph_data, f)
            
#         return graph_data

#     def get_graph(self, collection_name: str):
#         try:
#             with open(os.path.join(self.storage_dir, f"{collection_name}.json"), "r") as f:
#                 return json.load(f)
#         except Exception:
#             return {"nodes": [], "edges": []}


import os
import re
import json

class DependencyService:
    def __init__(self):
        self.storage_dir = "./dependency_graphs"
        os.makedirs(self.storage_dir, exist_ok=True)

    def build_graph(self, repo_path: str, collection_name: str):
        nodes = []
        edges = []
        node_ids = set()
        file_map = {}
        
        # Improved Regex
        js_pattern = re.compile(r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]')
        py_pattern = re.compile(r'^\s*(?:from\s+([\w\.]+)\s+import|import\s+([\w\.]+))', re.MULTILINE)
        
        # PASS 1: Build the File Map
        for root, _, files in os.walk(repo_path):
            if ".git" in root or "node_modules" in root or "__pycache__" in root:
                continue
                
            for file in files:
                if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.py')):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, repo_path).replace("\\", "/")
                    
                    # Store exact path
                    file_map[rel_path] = rel_path
                    # Store extensionless path for JS module resolution
                    base_path, _ = os.path.splitext(rel_path)
                    file_map[base_path] = rel_path
                    
                    if rel_path not in node_ids:
                        nodes.append({"id": rel_path, "data": {"label": file}})
                        node_ids.add(rel_path)

        # PASS 2: Resolve Imports against the File Map
        for rel_path in list(node_ids):
            full_path = os.path.join(repo_path, rel_path)
            current_dir = os.path.dirname(rel_path)
            
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    targets = []
                    
                    if rel_path.endswith('.py'):
                        for match in py_pattern.findall(content):
                            target = match[0] if match[0] else match[1]
                            target_path = target.replace('.', '/') + '.py'
                            # Fallback to virtual if not in map
                            targets.append(file_map.get(target_path, f"virtual_{target}.py"))
                    else:
                        for match in js_pattern.findall(content):
                            if match.startswith('.'):
                                resolved = os.path.normpath(os.path.join(current_dir, match)).replace("\\", "/")
                                targets.append(file_map.get(resolved, f"virtual_{match.split('/')[-1]}"))
                                
                    for target_id in targets:
                        if target_id not in node_ids:
                            label = target_id.split('/')[-1].replace("virtual_", "")
                            nodes.append({"id": target_id, "data": {"label": label}})
                            node_ids.add(target_id)
                            
                        edges.append({
                            "id": f"{rel_path}-{target_id}", 
                            "source": rel_path, 
                            "target": target_id,
                            "animated": True
                        })
            except Exception:
                pass
        
        graph_data = {"nodes": nodes, "edges": edges}
        
        with open(os.path.join(self.storage_dir, f"{collection_name}.json"), "w") as f:
            json.dump(graph_data, f)
            
        return graph_data

    def get_graph(self, collection_name: str):
        try:
            with open(os.path.join(self.storage_dir, f"{collection_name}.json"), "r") as f:
                return json.load(f)
        except Exception:
            return {"nodes": [], "edges": []}