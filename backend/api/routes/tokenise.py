from fastapi import APIRouter
from pydantic import BaseModel

from services.tokenizer_registry import get_tokenizer

router = APIRouter()

class TokeniseRequest(BaseModel):
    inputText: str
    modelName: str | None = None

@router.post("/tokenise")
def tokenise(request: TokeniseRequest):
    model_name = request.modelName or "bert-base-uncased"

    tokenizer = get_tokenizer(model_name)

    if tokenizer is None:
        return None

    encoding = tokenizer(request.inputText,
                         return_offsets_mapping=True,
                         add_special_tokens=False)

    token_ids = encoding["input_ids"]
    offsets = encoding["offset_mapping"]

    token_strings = tokenizer.convert_ids_to_tokens(token_ids)
    tokens = [
        {
            "token": token,
            "start": start,
            "end": end
        }
        for token, (start, end) in zip(token_strings, offsets)
    ]

    return {
        "text": request.inputText,
        "tokens": tokens,
        "tokenCount": len(tokens)
    }