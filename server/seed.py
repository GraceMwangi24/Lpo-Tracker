from faker import Faker
from models import db, User, Product, Supplier, Requisition, LPO, RequisitionStatus, LPOStatus, RequisitionProduct, LPOProduct

fake = Faker()

def seed_database(db):
    try:
        # --- Users ---
        users = []
        for _ in range(3):
            user = User(
                name=fake.name(),
                email=fake.unique.email(),
                password_hash='password123',
                role='user'
            )
            db.session.add(user)
            users.append(user)

        # --- Products ---
        products = []
        for _ in range(5):
            product = Product(
                name=fake.word().capitalize(),
                price=round(fake.pyfloat(left_digits=3, right_digits=2, positive=True), 2),
                description=fake.sentence()
            )
            db.session.add(product)
            products.append(product)

        # --- Suppliers ---
        suppliers = []
        for _ in range(2):
            supplier = Supplier(
                name=fake.company(),
                contact_name=fake.name(),
                contact_email=fake.company_email(),
                contact_phone=fake.msisdn()[:10],
                address=fake.address()
            )
            db.session.add(supplier)
            suppliers.append(supplier)

        db.session.commit()

        # --- Requisitions + RequisitionProduct ---
        requisitions = []
        for user in users:
            req = Requisition(
                user_id=user.id,
                status=RequisitionStatus.PENDING,
                notes=fake.sentence()
            )
            db.session.add(req)
            db.session.commit()
            requisitions.append(req)

            for product in products[:2]:
                req_product = RequisitionProduct(
                    requisition_id=req.id,
                    product_id=product.id,
                    quantity=fake.random_int(min=1, max=5)
                )
                db.session.add(req_product)

        db.session.commit()

        # Approve one requisition
        approved_req = requisitions[0]
        approved_req.status = RequisitionStatus.APPROVED
        db.session.commit()

        # --- LPO + LPOProduct ---
        lpo = LPO(
            requisition_id=approved_req.id,
            supplier_id=suppliers[0].id,
            status=LPOStatus.PENDING
        )
        db.session.add(lpo)
        db.session.commit()

        for product in products[:2]:
            lpo_product = LPOProduct(
                lpo_id=lpo.id,
                product_id=product.id,
                quantity=fake.random_int(min=1, max=3),
                price=product.price
            )
            db.session.add(lpo_product)

        db.session.commit()

        print("✅ Database seeded successfully!")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Seeding error: {e}")
        raise e
