from fastapi import FastAPI
from api.routes.tokenise import router as tokeniser

app = FastAPI()
app.include_router(tokeniser)