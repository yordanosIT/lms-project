from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import models
from django.db.models import Count
from .models import Course, Category, Lesson, Enrollment, User
from .serializers import (
    CourseSerializer, CategorySerializer, LessonSerializer, 
    EnrollmentSerializer, UserSerializer, UserRegisterSerializer
)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Course.objects.all()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        instructor_only = self.request.query_params.get('instructor_only')
        
        if category:
            queryset = queryset.filter(category_id=category)
        if search:
            queryset = queryset.filter(title__icontains=search)
        if instructor_only and self.request.user.is_authenticated:
            queryset = queryset.filter(instructor=self.request.user)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """Get courses the current user is enrolled in"""
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        enrollments = Enrollment.objects.filter(student=request.user)
        courses = [enrollment.course for enrollment in enrollments]
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_teaching(self, request):
        """Get courses the current user is teaching"""
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        courses = Course.objects.filter(instructor=request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Lesson.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"detail": "Successfully logged out"})
        except Exception as e:
            return Response({"detail": "Already logged out"}, status=400)

class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role == 'instructor':
            # Stats for instructor
            courses = Course.objects.filter(instructor=user)
            total_courses = courses.count()
            total_students = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()
            total_lessons = Lesson.objects.filter(course__in=courses).count()
            
            return Response({
                'total_courses': total_courses,
                'total_students': total_students,
                'total_lessons': total_lessons,
            })
        else:
            # Stats for student
            enrolled_courses = Enrollment.objects.filter(student=user)
            enrolled_count = enrolled_courses.count()
            completed_count = enrolled_courses.filter(completed=True).count()
            in_progress = enrolled_count - completed_count
            
            return Response({
                'enrolled_courses': enrolled_count,
                'completed_courses': completed_count,
                'in_progress': in_progress,
                'available_courses': Course.objects.count(),
            })