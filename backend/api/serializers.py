from rest_framework import serializers
from .models import Category, Course, Lesson, Enrollment, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'role', 'created_at')

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'password', 'role')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student')
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'created_at')

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'course', 'title', 'content', 'video_url', 'order', 'created_at')
        read_only_fields = ('id', 'created_at')

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    lessons_count = serializers.IntegerField(source='lessons.count', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'price',
            'instructor', 'instructor_name',
            'category', 'category_name',
            'image', 'image_url',
            'lessons_count', 'is_enrolled',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'instructor', 'created_at', 'updated_at', 'lessons_count', 'is_enrolled')

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Enrollment.objects.filter(student=request.user, course=obj).exists()
        return False

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                # Return full URL with localhost:8000 instead of backend:8000
                return f"http://localhost:8000{obj.image.url}"
            return obj.image.url
        return None

class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    course_detail = CourseSerializer(source='course', read_only=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), write_only=True)
    
    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'course', 'course_detail', 'enrolled_at', 'completed', 'completed_at')
        read_only_fields = ('id', 'student', 'enrolled_at', 'completed', 'completed_at')