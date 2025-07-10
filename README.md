# 🚀 SmartShop

SmartShop is a modern, AI-powered retail and services management platform designed to empower businesses like boutiques, hardware stores, salons, cosmetics shops, interior decor studios, and more.

Built with a Django REST Framework backend and a React + Vite + Tailwind CSS frontend, SmartShop provides a seamless experience for shop owners, staff, and customers.

---

## ✨ Key Features

✅ **Role-Based Access** — Manage admins, sellers, customers, and government roles securely.

✅ **Product & Inventory Management** — Add, edit, and organize products with media galleries.

✅ **Booking System** — Allow customers to schedule appointments and services online.

✅ **Reviews & Ratings** — Let users review shops, products, and services.

✅ **AI-Powered Recommendations** — Suggest products and services tailored to customer interests.

✅ **Chat & Notifications** — Enable real-time communication and system notifications.

✅ **Media Hub** — Manage images and videos for products and promotions.

✅ **Analytics & Dashboards** — Visual reports for sales, revenue, bookings, and more.

✅ **Local Integrations** — Support for M-Pesa, Airtel Money, and Kenyan tax requirements.

✅ **Modern UI** — Clean, fast, and mobile-responsive interface using Tailwind CSS.

---

## 🛠 Tech Stack

- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Database:** SQLite (development), PostgreSQL (production-ready)
- **State Management:** Redux Toolkit
- **Auth:** JWT with Django Simple JWT
- **Docs:** Swagger / Redoc auto-generated API docs
- **CI/CD:** Ready for deployment pipelines

---

## 🎯 Why SmartShop?

Unlike generic ERP solutions, SmartShop focuses on modern retail and service businesses, providing specialized tools and integrations for:

- E-commerce shops
- Physical retail stores
- Salons and spas
- Interior decor studios


Our goal is to offer a smarter, faster with AI features and a beautiful user experience.

---

## 📚 Documentation

- API Docs (Swagger UI)
- Frontend under development – see `/frontend` for React project structure.

---

## ⚙️ Setup

See full instructions in the repo’s README for:

- Setting up the Django backend
- Running the Vite React frontend
- Configuring environment variables
- Database migrations

---

## 💡 Contribution

PRs are welcome! Please open an issue to discuss major changes first.
## 💡 Backend
# 1. Clone the repo
git clone https://github.com/Xnelliek/*SmartShop.git
cd SmartShop/smartshop

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Start the server
python manage.py runserver

##  Frontend
# 1. Go to frontend folder
cd ../frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev


