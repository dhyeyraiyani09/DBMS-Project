from fastapi import APIRouter, HTTPException
from .. import schemas
from ..services.ai_tutor import AITutorService

router = APIRouter(prefix="/api/ai", tags=["AI Tutor"])
tutor_service = AITutorService()

@router.post("/tutor", response_model=schemas.AITutorResponse)
async def tutor_interaction(request: schemas.AITutorRequest):
    try:
        # Prevent oversized questions
        if request.question and len(request.question) > 500:
            raise HTTPException(status_code=400, detail="Question too long.")
            
        result = await tutor_service.process_request(request.model_dump())
        
        # If the service returns an error that should act as a fallback state,
        # we return it normally in the JSON payload (success=False, error=msg)
        # rather than throwing a hard 500 HTTP exception, so the frontend UI can show it nicely.
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected AI service failure: {str(e)}")
