#!/bin/sh

# Wait for database - use 'db' as hostname
echo "Waiting for database at host: $DB_HOST..."

# Try to ping the database container
while ! nc -z ${DB_HOST} ${DB_PORT}; do
  echo "Database not ready at ${DB_HOST}:${DB_PORT}... waiting"
  sleep 2
done

echo "Database is ready at ${DB_HOST}:${DB_PORT}!"

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create default categories
echo "Creating default categories..."
python manage.py shell -c "
from api.models import Category
categories = ['Development', 'Business', 'Design', 'Marketing', 'Photography', 'Health']
for cat in categories:
    Category.objects.get_or_create(name=cat)
    print(f'Category {cat} ready')
"

# Start server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000