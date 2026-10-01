from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from typing import Annotated
from backend.models.order import BillStatus, Order, OrderItem, OrderStatus
from backend.core.database import get_db
from backend.utils.auth.dependancy import get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.schemas.order_validation import OrderQuery, AddOrder
from backend.models.user import User
from backend.models.menu import Menu

order_router = APIRouter()
db_session = Annotated[AsyncSession, Depends(get_db)]


@order_router.get("/")
async def get_order(db: db_session, q: Annotated[OrderQuery, Depends()] = OrderQuery()):
    try:
        stmt = select(Order)
        if q.total is not None:
            stmt = stmt.where(Order.total_amount == q.total)
        if q.user_name:
            stmt = stmt.join(Order.user).where(User.name == q.user_name)
        if q.bill_status:
            stmt = stmt.where(Order.bill_status ==
                              BillStatus(q.bill_status.value))
        if q.status:
            stmt = stmt.where(Order.status == OrderStatus(q.status.value))
        if q.user_id:
            stmt = stmt.where(Order.user_id == q.user_id)

        if q.sortBy == "user_name" and not q.user_name:
            stmt = stmt.join(Order.user)
        if q.sortBy in ("price", "quantity"):
            stmt = stmt.join(Order.items).distinct()

        sort_clm = {"user_name": User.name, "price": OrderItem.price, "total": Order.total_amount,
                    "quantity": OrderItem.quantity, "created_at": Order.created_at}[q.sortBy]

        stmt = stmt.order_by(
            sort_clm.asc() if q.sortOrder == "asc" else sort_clm.desc()
        )

        offset = (q.page - 1) * q.limit
        stmt = stmt.limit(q.limit).offset(offset)

        result = await db.execute(stmt)
        all_orders = result.scalars().unique().all()

        data = [
            {
                "id": str(order.id),
                "user_id": str(order.user_id),
                "total_amount": order.total_amount,
                "bill_status": order.bill_status.value if order.bill_status else None,
                "status": order.status.value if order.status else None,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "updated_at": order.updated_at.isoformat() if order.updated_at else None,
            }
            for order in all_orders
        ]

        return JSONResponse(
            content={
                "success": True,
                "message": "The orders were successfully fetched",
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


@order_router.post("/add-cart")
async def add_to_cart(data: AddOrder, db: db_session, user_id: str = Depends(get_current_user)):
    try:
        findUser = await db.get(User, user_id)
        if findUser == None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given user doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )

        total = 0
        add_order = Order(user_id=user_id, total_amount=0)
        db.add(add_order)
        await db.flush()

        items_data = []
        for i in data.orders:
            findMenu = await db.get(Menu, i.menu_id)
            if findMenu is None or findMenu.is_deleted:
                await db.rollback()
                return JSONResponse(
                    content={
                        "success": False,
                        "message": f"The given order item doesnt exist in our system",
                    },
                    status_code=status.HTTP_404_NOT_FOUND,
                )
            total += findMenu.price * i.quantity
            items_data.append((findMenu, i.quantity))

        add_order.total_amount = total

        created_items = []
        for findMenu, quantity in items_data:
            add_order_item = OrderItem(
                order_id=add_order.id, menu_id=findMenu.id, quantity=quantity, price=findMenu.price)
            db.add(add_order_item)
            created_items.append(add_order_item)

        await db.commit()
        await db.refresh(add_order)
        for item in created_items:
            await db.refresh(item)

        return JSONResponse(
            content={
                "success": True,
                "message": "The order was successfully added",
                "data": {
                    "id": str(add_order.id),
                    "user_id": str(add_order.user_id),
                    "total_amount": add_order.total_amount,
                    "items": [
                        {
                            "id": str(item.id),
                            "menu_id": str(item.menu_id),
                            "quantity": item.quantity,
                            "price": item.price,
                        }
                        for item in created_items
                    ],
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


@order_router.patch("/complete/{order_id}")
async def complete_order(order_id: str, db: db_session, user_id: str = Depends(get_current_user)):
    try:
        find_order = await db.get(Order, order_id)
        if find_order is None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if find_order.status == OrderStatus.COMPLETED:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order is already completed",
                },
                status_code=status.HTTP_409_CONFLICT,
            )
        if find_order.status == OrderStatus.CANCELLED:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given cancelled order cannot be completed",
                },
                status_code=status.HTTP_409_CONFLICT,
            )

        find_order.status = OrderStatus.COMPLETED
        await db.commit()
        await db.refresh(find_order)
        return JSONResponse(
            content={
                "success": True,
                "message": "The order was completed",
            }
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


@order_router.delete("/cancel/{order_id}")
async def remove_order(order_id: str, db: db_session, user_id: str = Depends(get_current_user)):
    try:
        find_order = await db.get(Order, order_id)
        if find_order is None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        if find_order.user_id != user_id:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order doesnt belong to you",
                },
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        if find_order.status == OrderStatus.COMPLETED:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order is already completed",
                },
                status_code=status.HTTP_409_CONFLICT,
            )
        if find_order.status == OrderStatus.CANCELLED:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order is already cancelled",
                },
                status_code=status.HTTP_409_CONFLICT,
            )

        find_order.status = OrderStatus.CANCELLED
        await db.commit()
        await db.refresh(find_order)
        return JSONResponse(
            content={
                "success": True,
                "message": "The order was cancelled",
            }
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


@order_router.get("/{order_id}")
async def get_order_detail(order_id: str, db: db_session, user_id: str = Depends(get_current_user)):
    try:
        find_order = await db.get(Order, order_id)
        if find_order is None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        items = (await db.execute(select(OrderItem).where(OrderItem.order_id == order_id))).scalars().all()
        return JSONResponse(
            content={
                "success": True,
                "message": "The order was successfully fetched",
                "data": {
                    "id": str(find_order.id),
                    "user_id": str(find_order.user_id),
                    "total_amount": find_order.total_amount,
                    "bill_status": find_order.bill_status.value if find_order.bill_status else None,
                    "status": find_order.status.value if find_order.status else None,
                    "created_at": find_order.created_at.isoformat() if find_order.created_at else None,
                    "updated_at": find_order.updated_at.isoformat() if find_order.updated_at else None,
                    "items": [
                        {
                            "id": str(item.id),
                            "menu_id": str(item.menu_id),
                            "quantity": item.quantity,
                            "price": item.price,
                        }
                        for item in items
                    ],
                },
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


@order_router.patch("/pay/{order_id}")
async def pay_order(order_id: str, db: db_session, user_id: str = Depends(get_current_user)):
    try:
        find_order = await db.get(Order, order_id)
        if find_order is None:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order doesnt exist in our system",
                },
                status_code=status.HTTP_404_NOT_FOUND,
            )
        if find_order.bill_status == BillStatus.PAID:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"The given order is already paid",
                },
                status_code=status.HTTP_409_CONFLICT,
            )
        find_order.bill_status = BillStatus.PAID
        await db.commit()
        await db.refresh(find_order)
        return JSONResponse(
            content={
                "success": True,
                "message": "The order was successfully paid",
            }
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
