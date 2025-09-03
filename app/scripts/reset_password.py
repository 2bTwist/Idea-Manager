import asyncio
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash


async def main():
    email = "ndanjiedmond@gmail.com"
    new_password = "newPass123"
    async with SessionLocal() as db:
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if not user:
            print("User not found:", email)
            return
        user.hashed_password = get_password_hash(new_password)
        await db.commit()
        print("Password updated for:", email)


if __name__ == "__main__":
    asyncio.run(main())
