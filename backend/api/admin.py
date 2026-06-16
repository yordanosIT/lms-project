from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Category, Course, Lesson, Enrollment

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'created_at', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'full_name')
    ordering = ('-created_at',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'instructor', 'created_at')
    list_filter = ('category', 'instructor')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'content')
    ordering = ('course', 'order')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at')  # ✅ Fixed: changed to enrolled_at
    list_filter = ('course', 'enrolled_at')  # ✅ Fixed: changed to enrolled_at
    search_fields = ('student__email', 'student__full_name', 'course__title')
    ordering = ('-enrolled_at',)  # ✅ Fixed: changed to enrolled_at