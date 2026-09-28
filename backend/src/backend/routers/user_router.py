from fastapi import APIRouter, Depends, status
from backend.schemas.user_validation import create_user, login_user_data, update_user_data
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from backend.core.database import get_db
from sqlalchemy import select
from fastapi.responses import JSONResponse
from backend.utils.auth import hash, jwt
from backend.models.user import User as DBUser
from backend.utils.auth.dependancy import get_current_user

user_router = APIRouter()
db_session = Annotated[AsyncSession, Depends(get_db)]


@user_router.post("/signup")
async def get_signup(data: create_user, db: db_session):
    try:
        user = await db.scalar(select(DBUser).where(DBUser.email == data.email))
        if user:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given email {data.email} is already in use",
                },
                status_code=status.HTTP_409_CONFLICT,
            )
        hashed_password = hash.hash_password(data.password)
        created_user = DBUser(email=data.email, name=data.name,
                              role=data.role, password=hashed_password)
        db.add(created_user)
        await db.commit()
        await db.refresh(created_user)

        access_token = jwt.create_access_token(created_user.id)

        return JSONResponse(
            content={
                "success": True,
                "message": f"The given user was successfully created",
                "data": {
                    "access_token": access_token,
                    "token_type": "bearer",
                },
            },
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}"
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@user_router.post("/login")
async def login_user(data: login_user_data, db: db_session):
    try:
        user = await db.scalar(select(DBUser).where(DBUser.email == data.email))

        if user == None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given email {data.email} is doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        verified_password = hash.verify_password(data.password, user.password)

        if verified_password == False:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"Invalid password was provided",
                },
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        access_token = jwt.create_access_token(user.id)
        return JSONResponse(
            content={
                "success": True,
                "message": f"The given user was successfully logged-in",
                "data": {
                    "access_token": access_token,
                    "token_type": "bearer",
                },
            },
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}"
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@user_router.get("/me")
async def get_user_details(db: db_session, user_id: str = Depends(get_current_user)):
    try:
        user = await db.get(DBUser, user_id)
        if user == None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given user doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return JSONResponse(
            content={
                "success": True,
                "message": f"The given user successfully fetched",
                "data": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                    "user_status": user.user_status,
                    "created_at": user.created_at,
                },
            },
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}"
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@user_router.patch("/edit")
async def update_user(db: db_session, data: update_user_data, user_id: str = Depends(get_current_user)):
    try:
        user = await db.get(DBUser, user_id)
        if user == None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given user doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        updates = data.model_dump(exclude_unset=True)
        for fields, value in updates.items():
            setattr(user, fields, value)
        await db.commit()
        await db.refresh(user)
        return JSONResponse(
            content={
                "success": True,
                "message": f"The given user successfully fetched",
                "data": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                    "user_status": user.user_status,
                    "created_at": user.created_at,
                },
            },
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}"
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@user_router.delete("/delete")
async def delete_user(db: db_session, user_id: str = Depends(get_current_user)):
    try:
        user = await db.get(DBUser, user_id)
        if user == None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given user doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        await db.delete(user)
        await db.commit()
        return JSONResponse(
            content={
                "success": True,
                "message": f"The given user successfully deleted",
            },
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}"
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
