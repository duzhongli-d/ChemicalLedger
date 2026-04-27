import httpx
from app.core.config import get_settings


async def create_notebook(file_url: str, name: str) -> dict:
    """Create a NotebookLM notebook from a file URL."""
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.NOTEBOOKLM_BASE_URL}/notebooks",
            headers={"Authorization": f"Bearer {settings.NOTEBOOKLM_API_KEY}"},
            json={"name": name, "file_url": file_url},
        )
        response.raise_for_status()
        return response.json()


async def ask_question_stream(notebook_id: str, question: str):
    """Stream answers from a NotebookLM notebook."""
    settings = get_settings()

    async def generator():
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{settings.NOTEBOOKLM_BASE_URL}/notebooks/{notebook_id}/ask",
                headers={"Authorization": f"Bearer {settings.NOTEBOOKLM_API_KEY}"},
                json={"question": question},
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        yield line[5:]

    return generator()
