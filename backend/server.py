"""Backend intentionally minimal — this tool is a static frontend only.
Kept only so the supervised process stays healthy in this preview environment."""

from fastapi import FastAPI

app = FastAPI(title="GMC Compare - static tool (no backend)")


@app.get("/api/")
async def root():
    return {"tool": "gmc-compare", "backend": "not used", "mode": "static"}
