import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"  # change in prod!

async def main():
    async with SessionLocal() as db:  # type: AsyncSession
        res = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
        admin = res.scalar_one_or_none()
        if admin:
            print("Admin already exists:", admin.email)
            return
        admin = User(
            email=ADMIN_EMAIL,
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            full_name="Admin",
            is_active=True,
            is_superuser=True,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        print("Admin created:", admin.email)

if __name__ == "__main__":
    asyncio.run(main())
