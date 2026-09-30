from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from backend.models.menu import Menu as DBMenu, Menu_status
from backend.core.database import get_db
from backend.utils.auth.dependancy import get_current_user
from fastapi.responses import JSONResponse
from backend.schemas.menu_validation import DishQuery, AddDish, EditDish
from sqlalchemy import select

menu_router = APIRouter()
db_session = Annotated[AsyncSession, Depends(get_db)]


@menu_router.get("/")
async def get_menu(
    db: db_session,
    user_id: str = Depends(get_current_user),
    q: Annotated[DishQuery, Depends()] = DishQuery(),
):
    try:
        stmt = select(DBMenu)
        if q.name:
            stmt = stmt.where(DBMenu.name.ilike(f"%{q.name}%"))
        if q.description:
            stmt = stmt.where(DBMenu.description.ilike(f"%{q.description}%"))
        if q.price is not None:
            stmt = stmt.where(DBMenu.price == q.price)
        if q.status:
            stmt = stmt.where(DBMenu.status == Menu_status(q.status.value))
        if q.isDeleted is not None:
            stmt = stmt.where(DBMenu.is_deleted == q.isDeleted)
        if q.min_price is not None:
            stmt = stmt.where(DBMenu.price >= q.min_price)
        if q.max_price is not None:
            stmt = stmt.where(DBMenu.price <= q.max_price)
        if q.isDeleted is None:
            stmt = stmt.where(DBMenu.is_deleted == False)

        offset = (q.page - 1) * q.limit
        stmt = stmt.limit(q.limit).offset(offset)

        sort_clm = {"name": DBMenu.name, "price": DBMenu.price}[q.sortBy]

        stmt = stmt.order_by(
            sort_clm.asc() if q.sortOrder == "asc" else sort_clm.desc()
        )

        result = await db.execute(stmt)
        all_menu = result.scalars().all()

        data = [
            {
                "id": str(dish.id),
                "name": dish.name,
                "description": dish.description,
                "price": dish.price,
                "status": dish.status.value if dish.status else None,
                "is_deleted": dish.is_deleted,
                "admin_id": str(dish.admin_id) if dish.admin_id else None,
                "created_at": dish.created_at.isoformat() if dish.created_at else None,
                "updated_at": dish.updated_at.isoformat() if dish.updated_at else None,
            }
            for dish in all_menu
        ]

        return JSONResponse(
            content={
                "success": True,
                "message": f"The menu was successfully fetched",
                "data": data,
            }
        )

    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}",
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@menu_router.post("/create")
async def add_dish(
    data: AddDish, db: db_session, user_id: str = Depends(get_current_user)
):
    try:
        findDish = await db.scalar(select(DBMenu).where(DBMenu.name == data.name))

        if findDish and findDish.is_deleted == False:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given dish name already exists in menu",
                    "error": f"Invalid dish name was provided",
                },
                status_code=status.HTTP_409_CONFLICT,
            )

        if findDish and findDish.is_deleted == True:
            delete_dish = await db.delete(DBMenu, findDish.id)
            await db.delete(delete_dish)
            await db.commit()

        added_dish = DBMenu(
            name=data.name,
            description=data.description,
            price=data.price,
            status=Menu_status(data.status.value),
            admin_id=user_id,
        )
        db.add(added_dish)
        await db.commit()
        await db.refresh(added_dish)

        return JSONResponse(
            content={
                "success": True,
                "message": f"The dish was successfully added to the menu",
                "data": {
                    "id": str(added_dish.id),
                    "name": added_dish.name,
                    "description": added_dish.description,
                    "price": added_dish.price,
                    "status": added_dish.status.value if added_dish.status else None,
                    "is_deleted": added_dish.is_deleted,
                    "admin_id": str(added_dish.admin_id)
                    if added_dish.admin_id
                    else None,
                    "created_at": added_dish.created_at.isoformat()
                    if added_dish.created_at
                    else None,
                    "updated_at": added_dish.updated_at.isoformat()
                    if added_dish.updated_at
                    else None,
                },
            },
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        await db.rollback()
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}",
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@menu_router.patch("/edit/{id}")
async def edit_dish(
    id: str, data: EditDish, db: db_session, user_id: str = Depends(get_current_user)
):
    try:
        find_dish = await db.get(DBMenu, id)
        if find_dish == None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given dish doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        if find_dish.is_deleted == True:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given dish doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        updates = data.model_dump(exclude_unset=True)
        for fields, value in updates.items():
            setattr(find_dish, fields, value)
        await db.commit()
        await db.refresh(find_dish)
        return JSONResponse(
            content={
                "success": True,
                "message": f"The given dish successfully edited",
                "data": {
                    "id": str(find_dish.id),
                    "name": find_dish.name,
                    "description": find_dish.description,
                    "price": find_dish.price,
                    "status": find_dish.status.value if find_dish.status else None,
                    "created_at": find_dish.created_at.isoformat()
                    if find_dish.created_at
                    else None,
                },
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        await db.rollback()
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}",
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@menu_router.delete("/delete/{id}")
async def delete_dish(
    id: str, db: db_session, user_id: str = Depends(get_current_user)
):
    try:
        find_dish = await db.get(DBMenu, id)
        if find_dish == None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given dish doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if find_dish.is_deleted == True:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given dish doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        find_dish.is_deleted = True
        await db.commit()
        return JSONResponse(
            content={
                "success": True,
                "message": "The dish was successfully deleted",
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        await db.rollback()
        return JSONResponse(
            content={
                "success": False,
                "message": f"Internal Error occured",
                "error": f"{str(e)}",
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
