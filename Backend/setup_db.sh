#!/bin/bash

echo "🚀 Setting up database with mock data..."
echo ""

# Activate virtual environment
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
fi

# Run migrations
echo "📦 Creating migrations..."
python manage.py makemigrations

echo ""
echo "🔄 Running migrations..."
python manage.py migrate

echo ""
echo "👥 Creating mock data..."
python manage.py create_mock_data

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📧 Test credentials:"
echo "   Email: manu042kpaperwork@gmail.com"
echo "   Email: manu04kus@gmail.com"
echo "   Password: password123"
echo ""
