
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