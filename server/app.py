from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, User, Product, Supplier, Requisition, LPO, RequisitionStatus, LPOStatus,RequisitionProduct
from config import Config
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS


app = Flask(__name__)
CORS(app)  # To allow frontend requests
CORS(app, origins=["http://127.0.0.1:5174"])

app.config.from_object(Config)
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)


@app.route('/')
def index():
    return jsonify({"message": "Welcome to the LPO Tracker API!"})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Bad credentials'}), 401

   
    token = create_access_token(identity={'id': user.id, 'role': user.role})
    return jsonify({'access_token': token}), 200

@app.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    current = get_jwt_identity()
    if current['role'] != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    data = request.get_json() or {}
    for fld in ('name','email','password','role'):
        if fld not in data:
            return jsonify({'error': f"{fld} is required"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already in use'}), 400

    user = User(
        name=data['name'],
        email=data['email'],
        password_hash=data['password'],  # will hash via model validator
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'id':    user.id,
       'name':  user.name,
       'email': user.email,
       'role':  user.role

       
}), 201

@app.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    current = get_jwt_identity()
    if current['role'] != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    all_users = User.query.all()
    return jsonify([{
        'id':    u.id,
        'name':  u.name,
        'email': u.email,
        'role':  u.role
    } for u in all_users]), 200




@app.route('/users/<int:user_id>/password', methods=['PUT'])
@jwt_required()
def reset_password(user_id):
    current = get_jwt_identity()
    if current['role'] != 'admin':
        return jsonify({'error':'Admins only'}), 403

    data = request.get_json() or {}
    new_pwd = data.get('password')
    if not new_pwd:
        return jsonify({'error':'password is required'}), 400

    user = User.query.get_or_404(user_id)
    user.password_hash = new_pwd   # hashed via validator
    db.session.commit()
    return jsonify({'message':'Password reset successful'}), 200

@app.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current = get_jwt_identity()
    if current['role'] != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    data = request.get_json() or {}
    user = User.query.get_or_404(user_id)

    # Update only the fields the admin sent
    user.name  = data.get('name', user.name)
    user.email = data.get('email', user.email)
    if 'role' in data:
        user.role = data['role']

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Email already in use.'}), 400

    return jsonify({
        'id':    user.id,
        'name':  user.name,
        'email': user.email,
        'role':  user.role
    }), 200

# ------------------- REQUISITIONS -------------------

# in app.py

@app.route('/requisitions', methods=['GET'])
@jwt_required()
def get_requisitions():
    current = get_jwt_identity()
    query = Requisition.query
    # non-admins only see their own
    if current['role'] != 'admin':
        query = query.filter_by(user_id=current['id'])

    status = request.args.get('status')
    if status:
        try:
            query = query.filter_by(status=RequisitionStatus(status))
        except ValueError:
            return jsonify({"error": "Invalid status filter."}), 400

    out = []
    for r in query.order_by(Requisition.created_at.desc()).all():
        # fetch user name
        usr = User.query.get(r.user_id)
        # build product list
        prods = []
        for rp in r.products:  # rp is RequisitionProduct
            p = Product.query.get(rp.product_id)
            prods.append({
                'id':       p.id,
                'name':     p.name,
                'quantity': rp.quantity,
                'price':    p.price
            })
        out.append({
            'id':         r.id,
            'user_id':    r.user_id,
            'user_name':  usr.name,
            'status':     r.status.value,
            'created_at': r.created_at.isoformat(),
            'notes':      r.notes or '',
            'products':   prods
        })
    return jsonify(out), 200

from collections import Counter

@app.route('/requisitions', methods=['POST'])
@jwt_required()
def create_requisition():
    current = get_jwt_identity()
    data = request.get_json() or {}

    try:
        # 1) Create the requisition
        new_req = Requisition(
            user_id=current['id'],
            status=RequisitionStatus(data.get('status', 'pending')),
            notes=data.get('notes', '')
        )
        db.session.add(new_req)
        db.session.commit()  # now new_req.id is available

        # 2) Count each product_id to determine quantity
        pid_list = data.get('product_ids', [])
        counts   = Counter(pid_list)

        # 3) Insert one RequisitionProduct per unique product, with aggregated quantity
        for pid, qty in counts.items():
            rp = RequisitionProduct(
                requisition_id=new_req.id,
                product_id=pid,
                quantity=qty
            )
            db.session.add(rp)

        db.session.commit()

        return jsonify({'message': 'Requisition created', 'id': new_req.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/requisitions/<int:req_id>', methods=['PUT'])
@jwt_required()
def update_requisition(req_id):
    current = get_jwt_identity()
    if current['role'] != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    req = Requisition.query.get_or_404(req_id)
    data = request.get_json() or {}

    if 'status' in data:
        try:
            req.status = RequisitionStatus(data['status'])
        except ValueError:
            return jsonify({'error': 'Invalid status value'}), 400

    db.session.commit()

    # re–serialize the single updated requisition:
    return jsonify({
        'id':         req.id,
        'user_id':    req.user_id,
        'user_name':  req.user.name,
        'status':     req.status.value,
        'created_at': req.created_at.isoformat(),
        'notes':      req.notes or '',
        'products': [{
            'id':       rp.product.id,
            'name':     rp.product.name,
            'quantity': rp.quantity,
            'price':    rp.product.price
        } for rp in req.products]
    }), 200



@app.route('/requisitions/<int:req_id>', methods=['DELETE'])
@jwt_required()
def delete_requisition(req_id):
    current = get_jwt_identity()
    req = Requisition.query.get_or_404(req_id)

    # permission + status checks...
    if req.status != RequisitionStatus.PENDING:
        return jsonify({'error': 'Only pending can be recalled'}), 400

    # manually delete the line‐items
    for rp in list(req.products):
        db.session.delete(rp)

    # now delete the requisition
    db.session.delete(req)
    db.session.commit()
    return jsonify({'message': f'Requisition #{req_id} recalled'}), 200


# ------------------- LPOs -------------------

@app.route('/lpos', methods=['GET'])
@jwt_required()
def get_lpos():
    current = get_jwt_identity()
    query = LPO.query.join(Requisition, LPO.requisition_id==Requisition.id)
    
    if current['role'] != 'admin':
        query = query.filter(Requisition.user_id==current['id'])
    
    sort = request.args.get('sort')
    if sort == 'date_asc':
        query = query.order_by(LPO.created_at.asc())
    elif sort == 'date_desc':
        query = query.order_by(LPO.created_at.desc())
    elif sort == 'status_asc':
        query = query.order_by(LPO.status.asc())
    elif sort == 'status_desc':
        query = query.order_by(LPO.status.desc())
    return jsonify([{
        'id': l.id,
        'requisition_id': l.requisition_id,
        'supplier_id': l.supplier_id,
        'status': l.status.value,
        'created_at': l.created_at.isoformat(),
        'total_value': l.total_value
    } for l in query.all()])

@app.route('/lpos/<int:id>', methods=['GET'])
def get_lpo(id):
    lpo = LPO.query.get_or_404(id)
    return jsonify({
        'id': lpo.id,
        'requisition_id': lpo.requisition_id,
        'supplier_id': lpo.supplier_id,
        'status': lpo.status.value,
        'created_at': lpo.created_at.isoformat(),
        'total_value': lpo.total_value
    })

@app.route('/lpos', methods=['POST'])
def create_lpo():
    data = request.json
    requisition = Requisition.query.get(data['requisition_id'])
    if not requisition or requisition.status != RequisitionStatus.APPROVED:
        return jsonify({'error': 'Requisition must be approved to create LPO'}), 400
    try:
        new_lpo = LPO(
            requisition_id=data['requisition_id'],
            supplier_id=data['supplier_id'],
            status=LPOStatus(data.get('status', 'pending')),
            total_value=data.get('total_value', 0.0)
        )
        db.session.add(new_lpo)
        db.session.commit()
        return jsonify({'message': 'LPO created', 'id': new_lpo.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/lpos/<int:id>', methods=['PUT'])
def update_lpo(id):
    lpo = LPO.query.get_or_404(id)
    data = request.json
    if 'status' in data:
        try:
            lpo.status = LPOStatus(data['status'])
        except ValueError:
            return jsonify({'error': 'Invalid status value'}), 400
    db.session.commit()
    return jsonify({'message': 'LPO status updated'})

# ------------------- PRODUCTS -------------------

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'description': p.description
    } for p in products])

@app.route('/products', methods=['POST'])
def create_product():
    data = request.json
    try:
        new_product = Product(
            name=data['name'],
            price=data['price'],
            description=data.get('description')
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Product created', 'id': new_product.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    product.description = data.get('description', product.description)
    db.session.commit()
    return jsonify({'message': 'Product updated'})

@app.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    if product.requisitions or product.lpos:
        return jsonify({'error': 'Cannot delete product linked to requisitions or LPOs'}), 400
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'})

# ------------------- SUPPLIERS -------------------

@app.route('/suppliers', methods=['GET'])
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'contact_name': s.contact_name,
        'contact_email': s.contact_email
    } for s in suppliers])

@app.route('/suppliers', methods=['POST'])
def create_supplier():
    data = request.json
    try:
        new_supplier = Supplier(
            name=data['name'],
            contact_name=data.get('contact_name'),
            contact_email=data.get('contact_email')
        )
        db.session.add(new_supplier)
        db.session.commit()
        return jsonify({'message': 'Supplier created', 'id': new_supplier.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/suppliers/<int:id>', methods=['PUT'])
def update_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    data = request.json
    supplier.name = data.get('name', supplier.name)
    supplier.contact_name = data.get('contact_name', supplier.contact_name)
    supplier.contact_email = data.get('contact_email', supplier.contact_email)
    db.session.commit()
    return jsonify({'message': 'Supplier updated'})

@app.route('/suppliers/<int:id>', methods=['DELETE'])
def delete_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    db.session.delete(supplier)
    db.session.commit()
    return jsonify({'message': 'Supplier deleted'})

@app.route('/seed', methods=['POST'])
def seed_data():
    from seed import seed_database
    try:
        seed_database(db)
        return jsonify({'message': 'Seeded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)