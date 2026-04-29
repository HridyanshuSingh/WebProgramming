"""
MediEquip Pro - Medical Equipment Website
Main Flask Application
"""

from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from models.database import db, User, Product, Inquiry, ChatLog
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from chatbot import get_chatbot_response, get_recommendations
from functools import wraps
import os, json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mediequip_secret_2024_change_in_prod'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medequip.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# ─── Decorators ────────────────────────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session or not session.get('is_admin'):
            flash('Admin access required.', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

# ─── Seed Products ──────────────────────────────────────────────────────────────
def seed_products():
    if Product.query.count() == 0:
        products = [
            Product(
                name="MRI Machine",
                category="Imaging",
                description="High-resolution Magnetic Resonance Imaging system for detailed soft-tissue diagnosis. Ideal for neurology, orthopedics, and oncology departments with 1.5T and 3.0T configurations.",
                specifications='{"Tesla": "1.5T / 3.0T", "Bore Diameter": "60-70 cm", "Scan Time": "15-45 min", "Weight": "4000-8000 kg", "Power": "380V / 3-phase", "Cooling": "Liquid Helium"}',
                features='["Wide-bore 70cm patient comfort", "High-field 3.0T resolution", "Silent scan technology", "AI-assisted image reconstruction", "DICOM 3.0 PACS compatible", "Whole-body imaging capability"]',
                availability=True,
                image_url="https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=600&q=80",
                tags="MRI,imaging,brain,spine,neurology,oncology"
            ),
            Product(
                name="CT Scan Machine",
                category="Imaging",
                description="Multi-slice Computed Tomography scanner delivering fast, accurate cross-sectional imaging for emergency and routine diagnostics with up to 256 slices.",
                specifications='{"Slices": "64 / 128 / 256", "Rotation Time": "0.3s", "Gantry Aperture": "70 cm", "kVp Range": "80-140 kV", "Weight": "1500-2500 kg", "Power": "380V AC"}',
                features='["64-slice technology", "Fast 0.3s rotation speed", "Reduced dose protocol", "3D reconstruction imaging", "AI-assisted analysis", "Emergency rapid scan mode"]',
                availability=True,
                image_url="https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80",
                tags="CT,scan,computed tomography,imaging,lung,abdomen,emergency"
            ),
            Product(
                name="ICU Ventilator",
                category="Critical Care",
                description="Advanced intensive care ventilator supporting invasive and non-invasive ventilation modes for critically ill patients in ICU and emergency settings.",
                specifications='{"Modes": "VC, PC, SIMV, CPAP, BiPAP", "Tidal Volume": "20-2000 mL", "FiO2 Range": "21%-100%", "PEEP": "0-35 cmH2O", "Weight": "18-25 kg", "Battery": "4h backup"}',
                features='["Invasive & non-invasive modes", "CPAP / BiPAP support", "High-resolution touch display", "Built-in nebulizer", "4-hour battery backup", "Automatic leak compensation"]',
                availability=True,
                image_url="https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=600&q=80",
                tags="ventilator,ICU,critical care,breathing,respiratory,CPAP,BiPAP"
            ),
            Product(
                name="Digital X-Ray System",
                category="Radiology",
                description="High-sensitivity flat-panel digital radiography system for rapid, low-dose imaging across general radiology and emergency applications.",
                specifications='{"Detector": "Flat Panel Amorphous Silicon", "Resolution": "3.4 lp/mm", "kVp": "40-150 kV", "Exposure Time": "1-5000 ms", "Weight": "200-400 kg", "Interface": "DICOM 3.0"}',
                features='["High resolution flat-panel detector", "Instant digital output", "Low radiation exposure", "Wireless connectivity", "Easy patient positioning", "Automatic exposure control"]',
                availability=True,
                image_url="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80",
                tags="X-ray,xray,radiology,chest,bone,fracture,digital"
            ),
            Product(
                name="Patient Monitor",
                category="Critical Care",
                description="Multi-parameter bedside patient monitoring system tracking vitals in real-time for ICU, OT, and general ward environments with wireless connectivity.",
                specifications='{"Parameters": "ECG, SpO2, NIBP, Temp, EtCO2", "Display": "15 inch TFT Touch", "Alarms": "Visual + Audible", "Battery": "6h", "Connectivity": "Wi-Fi, LAN, HL7"}',
                features='["ECG, SpO2, NIBP monitoring", "15-inch colour touchscreen", "Central station connectivity", "Visual & audible alarms", "6-hour battery backup", "HL7 / EMR integration"]',
                availability=True,
                image_url="https://images.unsplash.com/photo-1666214280250-deb8f0a61a2f?w=600&q=80",
                tags="patient monitor,ICU,ECG,SpO2,vitals,critical care,bedside"
            ),
            Product(
                name="Ultrasound Machine",
                category="Imaging",
                description="Portable and console ultrasound system for obstetrics, cardiology, and general imaging with high-definition real-time imaging and 4D capability.",
                specifications='{"Probes": "Linear, Curved, Phased Array", "Frequency": "2-18 MHz", "Display": "21.5 inch LED", "Modes": "2D, 3D, 4D, Doppler", "Weight": "30-60 kg"}',
                features='["4D imaging capability", "Advanced Doppler technology", "Portable trolley design", "Touchscreen interface", "Extended probe compatibility", "Real-time 3D/4D rendering"]',
                availability=True,
                image_url="https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=600&q=80",
                tags="ultrasound,sonography,imaging,obstetrics,cardiology,abdomen"
            ),
        ]
        db.session.bulk_save_objects(products)
        db.session.commit()
        print("Products seeded.")

# ─── Public Routes ──────────────────────────────────────────────────────────────

@app.route('/')
def index():
    products = Product.query.filter_by(availability=True).all()
    return render_template('index.html', products=products)

@app.route('/products')
def products():
    query    = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    prod_query = Product.query.filter_by(availability=True)
    if query:
        prod_query = prod_query.filter(
            db.or_(
                Product.name.ilike(f'%{query}%'),
                Product.description.ilike(f'%{query}%'),
                Product.tags.ilike(f'%{query}%')
            )
        )
    if category:
        prod_query = prod_query.filter_by(category=category)
    all_products = prod_query.all()
    categories   = [c[0] for c in db.session.query(Product.category).distinct().all()]
    return render_template('products.html', products=all_products,
                           categories=categories, query=query, selected_cat=category)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    related = Product.query.filter(
        Product.category == product.category,
        Product.id != product_id
    ).limit(3).all()
    return render_template('product_detail.html', product=product, related=related)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name    = request.form.get('name', '').strip()
        email   = request.form.get('email', '').strip()
        phone   = request.form.get('phone', '').strip()
        product = request.form.get('product', '').strip()
        message = request.form.get('message', '').strip()
        if not name or not email or not message:
            flash('Please fill in all required fields.', 'danger')
        else:
            inquiry = Inquiry(name=name, email=email, phone=phone,
                              product_interest=product, message=message,
                              user_id=session.get('user_id'))
            db.session.add(inquiry)
            db.session.commit()
            flash('Your inquiry has been submitted! Our team will contact you within 24 hours.', 'success')
            return redirect(url_for('contact'))
    products = Product.query.filter_by(availability=True).all()
    return render_template('contact.html', products=products)

# ─── Auth ───────────────────────────────────────────────────────────────────────

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if 'user_id' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        name     = request.form.get('name', '').strip()
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        phone    = request.form.get('phone', '').strip()
        if not name or not email or not password:
            flash('All fields are required.', 'danger')
        elif User.query.filter_by(email=email).first():
            flash('Email already registered. Please log in.', 'warning')
        elif len(password) < 6:
            flash('Password must be at least 6 characters.', 'danger')
        else:
            user = User(name=name, email=email,
                        password_hash=generate_password_hash(password), phone=phone)
            db.session.add(user)
            db.session.commit()
            flash('Account created! Please log in.', 'success')
            return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id']  = user.id
            session['username'] = user.name
            session['is_admin'] = user.is_admin
            flash(f'Welcome back, {user.name}!', 'success')
            return redirect(url_for('admin_dashboard') if user.is_admin else url_for('index'))
        else:
            flash('Invalid email or password.', 'danger')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

# ─── Admin ──────────────────────────────────────────────────────────────────────

@app.route('/admin')
@admin_required
def admin_dashboard():
    stats = {
        'users':     User.query.count(),
        'products':  Product.query.count(),
        'inquiries': Inquiry.query.count(),
        'chats':     ChatLog.query.count(),
    }
    recent_inquiries = Inquiry.query.order_by(Inquiry.created_at.desc()).limit(5).all()
    return render_template('admin/dashboard.html', stats=stats, recent_inquiries=recent_inquiries)

@app.route('/admin/inquiries')
@admin_required
def admin_inquiries():
    inquiries = Inquiry.query.order_by(Inquiry.created_at.desc()).all()
    return render_template('admin/inquiries.html', inquiries=inquiries)

@app.route('/admin/users')
@admin_required
def admin_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('admin/users.html', users=users)

@app.route('/admin/products')
@admin_required
def admin_products():
    products = Product.query.all()
    return render_template('admin/products.html', products=products)

@app.route('/admin/products/add', methods=['GET', 'POST'])
@admin_required
def admin_add_product():
    if request.method == 'POST':
        product = Product(
            name=request.form['name'],
            category=request.form['category'],
            description=request.form['description'],
            specifications=request.form['specifications'],
            features=request.form.get('features', '[]'),
            availability='availability' in request.form,
            image_url=request.form.get('image_url', ''),
            tags=request.form.get('tags', '')
        )
        db.session.add(product)
        db.session.commit()
        flash('Product added successfully!', 'success')
        return redirect(url_for('admin_products'))
    return render_template('admin/product_form.html', product=None, action='Add')

@app.route('/admin/products/edit/<int:pid>', methods=['GET', 'POST'])
@admin_required
def admin_edit_product(pid):
    product = Product.query.get_or_404(pid)
    if request.method == 'POST':
        product.name           = request.form['name']
        product.category       = request.form['category']
        product.description    = request.form['description']
        product.specifications = request.form['specifications']
        product.features       = request.form.get('features', '[]')
        product.availability   = 'availability' in request.form
        product.image_url      = request.form.get('image_url', '')
        product.tags           = request.form.get('tags', '')
        db.session.commit()
        flash('Product updated!', 'success')
        return redirect(url_for('admin_products'))
    return render_template('admin/product_form.html', product=product, action='Edit')

@app.route('/admin/products/delete/<int:pid>', methods=['POST'])
@admin_required
def admin_delete_product(pid):
    product = Product.query.get_or_404(pid)
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted.', 'info')
    return redirect(url_for('admin_products'))

@app.route('/admin/inquiry/delete/<int:iid>', methods=['POST'])
@admin_required
def admin_delete_inquiry(iid):
    inquiry = Inquiry.query.get_or_404(iid)
    db.session.delete(inquiry)
    db.session.commit()
    flash('Inquiry deleted.', 'info')
    return redirect(url_for('admin_inquiries'))

# ─── Chat API ────────────────────────────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data       = request.get_json(silent=True) or {}
    user_msg   = data.get('message', '').strip()
    session_id = data.get('session_id', 'anonymous')
    if not user_msg:
        return jsonify({'reply': 'Please type a message.'}), 400
    reply           = get_chatbot_response(user_msg)
    recommendations = get_recommendations(user_msg)
    log = ChatLog(session_id=session_id, user_message=user_msg,
                  bot_response=reply, user_id=session.get('user_id'))
    db.session.add(log)
    db.session.commit()
    return jsonify({'reply': reply, 'recommendations': recommendations})

@app.route('/api/products')
def api_products():
    products = Product.query.filter_by(availability=True).all()
    return jsonify([{
        'id': p.id, 'name': p.name, 'category': p.category,
        'description': p.description[:120] + '...', 'image_url': p.image_url
    } for p in products])

# ─── Error Handlers ──────────────────────────────────────────────────────────────

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('404.html'), 500

# ─── Init ────────────────────────────────────────────────────────────────────────

def create_admin():
    if not User.query.filter_by(email='admin@mediequip.com').first():
        admin = User(name='Admin', email='admin@mediequip.com',
                     password_hash=generate_password_hash('admin123'), is_admin=True)
        db.session.add(admin)
        db.session.commit()
        print("Admin created: admin@mediequip.com / admin123")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_admin()
        seed_products()
    app.run(debug=True, port=5000)
