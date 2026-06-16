export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'instructor';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: number;
  instructor_name: string;
  category: Category;
  category_name: string;
  price: string;
  image: string | null;
  image_url: string | null;
  lessons_count: number;
  is_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  course: number;
  title: string;
  content: string;
  video_url: string;
  order: number;
}

export interface Enrollment {
  id: number;
  student: User;
  course: number;
  course_detail: Course;
  enrollment_date: string;
}

export interface DashboardStats {
  total_courses: number;
  total_students: number;
  total_enrollments: number;
}
