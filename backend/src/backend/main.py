from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Annotated

def main():
    uvicorn.run(
        "backend.main:app",
        port=8000,
        reload=True
    )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET","POST","PATCH","PUT","OPTIONS","DELETE"],
    allow_headers=["*"]
)

@app.get("/")
def get_hello():
    return {
        "success": True,
        "message": "Hello World! The server is running",
    }