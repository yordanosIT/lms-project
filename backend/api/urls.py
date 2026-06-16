from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, LessonViewSet, CategoryViewSet, 
    EnrollmentViewSet, UserViewSet, RegisterView, ProfileView, LogoutView, StatsView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('stats/', StatsView.as_view(), name='stats'),
]