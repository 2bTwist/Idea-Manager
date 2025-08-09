from fastapi import APIRouter

router = APIRouter()

@router.get("/ideas", summary="List all ideas")
async def list_ideas():
    return {"items": [], "total": 0}