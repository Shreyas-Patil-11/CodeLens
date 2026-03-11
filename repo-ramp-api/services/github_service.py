# # import os
# # import shutil
# # import tempfile
# # from git import Repo

# # class GithubService:
# #     def __init__(self):
# #         self.temp_dir = tempfile.mkdtemp()

# #     def clone_repository(self, repo_url: str) -> str:
# #         repo_name = repo_url.split("/")[-1].replace(".git", "")
# #         clone_path = os.path.join(self.temp_dir, repo_name)

# #         if os.path.exists(clone_path):
# #             shutil.rmtree(clone_path)
            
# #         try:
# #             Repo.clone_from(repo_url, clone_path)
# #             return clone_path
# #         except Exception as e:
# #             raise Exception(f"Failed to clone repository: {str(e)}")

# #     def cleanup(self):
# #         if os.path.exists(self.temp_dir):
# #             shutil.rmtree(self.temp_dir)

# import os
# import shutil
# import stat
# import tempfile
# from git import Repo

# # Helper function to bypass Windows read-only file errors
# def remove_readonly(func, path, excinfo):
#     # Change the permission to write
#     os.chmod(path, stat.S_IWRITE)
#     # Try calling the deletion function again
#     func(path)

# class GithubService:
#     def __init__(self):
#         self.temp_dir = tempfile.mkdtemp()

#     def clone_repository(self, repo_url: str) -> str:
#         repo_name = repo_url.split("/")[-1].replace(".git", "")
#         clone_path = os.path.join(self.temp_dir, repo_name)

#         # Use our helper function if the folder already exists
#         if os.path.exists(clone_path):
#             shutil.rmtree(clone_path, onerror=remove_readonly)
            
#         try:
#             Repo.clone_from(repo_url, clone_path)
#             return clone_path
#         except Exception as e:
#             raise Exception(f"Failed to clone repository: {str(e)}")

#     def cleanup(self):
#         # Use our helper function for the final cleanup
#         if os.path.exists(self.temp_dir):
#             shutil.rmtree(self.temp_dir, onerror=remove_readonly)

import subprocess
from fastapi import HTTPException

class GitHubService:
    def clone_repository(self, repo_url: str, temp_dir: str) -> str:
        """
        Clones a GitHub repository directly into the provided temporary directory.
        Using --depth 1 ensures we don't download the entire commit history, making it lightning fast.
        """
        try:
            # Basic validation
            if not repo_url.startswith("https://github.com/"):
                raise ValueError("Only standard https://github.com/ URLs are supported.")

            print(f"Cloning {repo_url} into {temp_dir}...")
            
            # Execute the git clone command
            subprocess.run(
                ["git", "clone", "--depth", "1", repo_url, temp_dir],
                check=True,
                capture_output=True,
                text=True
            )
            
            return temp_dir
            
        except subprocess.CalledProcessError as e:
            # If Git fails (e.g., private repo or bad URL), we catch the stderr
            raise HTTPException(status_code=400, detail=f"Failed to clone repository: {e.stderr}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")