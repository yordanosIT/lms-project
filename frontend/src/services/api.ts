import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { User, Category, Course, Lesson, Enrollment, DashboardStats } from '../types'

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  user: User;
  access: string;
  refresh: string;
}

// Use empty string to let proxy handle routing
const getBaseUrl = () => {
  return ''; // Proxy will handle /api routes
};

// Base query with token refresh
const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Custom base query with refresh token logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      const refreshResult = await baseQuery({
        url: '/api/auth/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      }, api, extraOptions);
      
      if (refreshResult.data) {
        const { access } = refreshResult.data as { access: string };
        localStorage.setItem('access_token', access);
        result = await baseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Course', 'Lesson', 'Enrollment', 'Profile', 'Stats', 'Category'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/api/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Profile', 'Stats'],
      transformResponse: (response: LoginResponse) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        return response;
      },
    }),
    
    register: builder.mutation<RegisterResponse, { email: string; full_name: string; password: string; role?: string }>({
      query: (data) => ({
        url: '/api/auth/register/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile', 'Stats'],
      transformResponse: (response: RegisterResponse) => {
        if (response.access && response.refresh) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
        }
        return response;
      },
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout/',
        method: 'POST',
      }),
      invalidatesTags: ['Profile', 'Stats', 'Course', 'Lesson', 'Enrollment'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          dispatch(api.util.resetApiState());
        }
      },
    }),
    
    getProfile: builder.query<User, void>({
      query: () => '/api/auth/profile/',
      providesTags: ['Profile'],
    }),

    // Category endpoints
    getCategories: builder.query<Category[], void>({
      query: () => '/api/categories/',
      providesTags: ['Category'],
    }),

    // Course endpoints
    getCourses: builder.query<Course[], { category?: number; search?: string; instructor_only?: boolean } | void>({
      query: (params) => {
        const urlParams = new URLSearchParams();
        if (params) {
          if (params.category) urlParams.append('category', params.category.toString());
          if (params.search) urlParams.append('search', params.search);
          if (params.instructor_only) urlParams.append('instructor_only', 'true');
        }
        const queryString = urlParams.toString();
        return `/api/courses/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Course' as const, id })), { type: 'Course', id: 'LIST' }]
          : [{ type: 'Course', id: 'LIST' }],
    }),
    
    getCourse: builder.query<Course, number>({
      query: (id) => `/api/courses/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),
    
    createCourse: builder.mutation<Course, FormData>({
      query: (formData) => ({
        url: '/api/courses/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }, 'Stats'],
    }),
    
    updateCourse: builder.mutation<Course, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/api/courses/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),
    
    deleteCourse: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/courses/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }, 'Stats'],
    }),

    // Lesson endpoints
    getLessons: builder.query<Lesson[], { course_id: number }>({
      query: ({ course_id }) => `/api/lessons/?course_id=${course_id}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Lesson' as const, id })), { type: 'Lesson', id: 'LIST' }]
          : [{ type: 'Lesson', id: 'LIST' }],
    }),
    
    createLesson: builder.mutation<Lesson, { title: string; content: string; video_url?: string; order: number; course: number }>({
      query: (lesson) => ({
        url: '/api/lessons/',
        method: 'POST',
        body: lesson,
      }),
      invalidatesTags: [{ type: 'Lesson', id: 'LIST' }, { type: 'Course', id: 'LIST' }],
    }),
    
    updateLesson: builder.mutation<Lesson, { id: number; data: Partial<Lesson> }>({
      query: ({ id, data }) => ({
        url: `/api/lessons/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Lesson', id },
        { type: 'Lesson', id: 'LIST' },
      ],
    }),
    
    deleteLesson: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/lessons/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Lesson', id: 'LIST' }, { type: 'Course', id: 'LIST' }],
    }),

    // Enrollment endpoints
    enroll: builder.mutation<Enrollment, { course: number }>({
      query: (body) => ({
        url: '/api/enrollments/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Enrollment', { type: 'Course', id: 'LIST' }, 'Stats'],
    }),
    
    getMyCourses: builder.query<Course[], void>({
  query: () => '/api/courses/my_courses/',  // Correct endpoint
  providesTags: ['Enrollment'],
}),
    getEnrollments: builder.query<Enrollment[], void>({
      query: () => '/api/enrollments/',
      providesTags: ['Enrollment'],
    }),

    // Stats
    getStats: builder.query<DashboardStats, void>({
      query: () => '/api/stats/',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useGetCategoriesQuery,
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useEnrollMutation,
  useGetMyCoursesQuery,
  useGetEnrollmentsQuery,
  useGetStatsQuery,
} = api;