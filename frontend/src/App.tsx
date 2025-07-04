import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Login from './components/auth/Login';
import SignIn from './components/auth/Signin';
import Logout from './components/auth/Logout';
import AdminDashboard from './components/admin/adminDashboard';
import AdminDashboardContent from './components/admin/AdminDashboardContent';
import AddStudent from './components/admin/AddStudent';
import AddCourse from './components/admin/AddCourse';
import StudentList from './components/admin/StudentList';
import CourseList from './components/admin/CourseList';
import AddLibrary from './components/admin/addLibrary';
import BookList from './components/admin/BookList';
import TeacherManagement from './components/admin/TeacherManagement';
import Profile from './components/admin/Profile';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherDashboardContent from './components/teacher/TeacherDashboardContent';
import AttendanceManager from './components/teacher/AttendanceManager';
import GradeManager from './components/teacher/GradeManager';
import Chat from './components/teacher/Chat';
import SettingProfile from './components/teacher/setting & profil';
import Exams from './components/teacher/Exams';
import Assignments from './components/teacher/Assignments';
import StudentDashboard from './components/student/StudentDashboard';
import Dashboard from './components/student/Dashboard';
import CourseRegistration from './components/student/CourseRegistration';
import ViewGrades from './components/student/ViewGrades';
import ViewAttendance from './components/student/ViewAttendance';
import ExamSchedule from './components/student/ExamSchedule';
import ClassSchedule from './components/student/ClassSchedule';
import Communication from './components/student/Communication';
import SettingsProfile from './components/student/SettingsProfile';
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './components/Unauthorized';

// New component to use useAuth within AuthProvider
const AppContent: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const { user, loading } = useAuth();

  const switchToLogin = () => setIsLogin(true);
  const switchToSignIn = () => setIsLogin(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLogin ? (
            <Login switchToSignIn={switchToSignIn} />
          ) : (
            <SignIn switchToLogin={switchToLogin} />
          )
        }
      />
      <Route path="/logout" element={<Logout />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/components/admin" element={<AdminDashboard />}>
          <Route index element={<AdminDashboardContent userName={user?.name || 'Admin'} />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="student-list" element={<StudentList />} />
          <Route path="course-list" element={<CourseList />} />
          <Route path="add-library" element={<AddLibrary />} />
          <Route path="book-list" element={<BookList />} />
          <Route path="profile" element={<Profile />} />
          <Route path="teacher-management" element={<TeacherManagement />} />
          <Route path="settings" element={<SettingsProfile />} />
        </Route>
      </Route>
      <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
        <Route path="/components/teacher" element={<TeacherDashboard />}>
          <Route index element={<TeacherDashboardContent userName={user?.name || 'Teacher'} />} />
          <Route path="attendance" element={<AttendanceManager />} />
          <Route path="grade-management" element={<GradeManager />} />
          <Route path="chat" element={<Chat />} />
          <Route path="settings-profile" element={<SettingProfile />} />
          <Route path="exam" element={<Exams />} />
          <Route path="assignments" element={<Assignments />} />
        </Route>
      </Route>
      <Route element={<PrivateRoute allowedRoles={['student']} />}>
        <Route path="/components/student" element={<StudentDashboard />}>
          <Route index element={<Dashboard userName={user?.name || 'Student'} studId={user?.id || ''} />} />
          <Route path="course-registration" element={<CourseRegistration />} />
          <Route path="grades" element={<ViewGrades />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="attendance" element={<ViewAttendance />} />
          <Route path="exam-schedule" element={<ExamSchedule />} />
          <Route path="schedule" element={<ClassSchedule />} />
          <Route path="chat" element={<Communication />} />
          <Route path="settings-profile" element={<SettingsProfile />} />
        </Route>
      </Route>
      <Route path="*" element={<Unauthorized />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {console.log('AuthProvider rendered')}
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
/*import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import SignIn from './components/auth/Signin';
import Logout from './components/auth/Logout'; // New import
import AdminDashboard from './components/admin/adminDashboard';
import AdminDashboardContent from './components/admin/AdminDashboardContent';
import AddStudent from './components/admin/AddStudent';
import AddCourse from './components/admin/AddCourse';
import StudentList from './components/admin/StudentList';
import CourseList from './components/admin/CourseList';
import AddLibrary from './components/admin/addLibrary';
import BookList from './components/admin/BookList';
import TeacherManagement from './components/admin/TeacherManagement';
import Profile from './components/admin/Profile';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherDashboardContent from './components/teacher/TeacherDashboardContent';
import AttendanceManager from './components/teacher/AttendanceManager';
import GradeManager from './components/teacher/GradeManager';
import Chat from './components/teacher/Chat';
import SettingProfile from './components/teacher/setting & profil';
import Exams from './components/teacher/Exams';
import Assignments from './components/teacher/Assignments';
import StudentDashboard from './components/student/StudentDashboard'; // Fixed typo
import Dashboard from './components/student/Dashboard';
import CourseRegistration from './components/student/CourseRegistration';
import ViewGrades from './components/student/ViewGrades';
import ViewAttendance from './components/student/ViewAttendance';
import ExamSchedule from './components/student/ExamSchedule';
import ClassSchedule from './components/student/ClassSchedule';
import Communication from './components/student/Communication';
import SettingsProfile from './components/student/SettingsProfile';
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './components/Unauthorized';
import useAuth  from './components/useAuth';

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const { user, loading } = useAuth();

  const switchToLogin = () => setIsLogin(true);
  const switchToSignIn = () => setIsLogin(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLogin ? (
              <Login switchToSignIn={switchToSignIn} />
            ) : (
              <SignIn switchToLogin={switchToLogin} />
            )
          }
        />
        <Route path="/logout" element={<Logout />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/components/admin" element={<AdminDashboard />}>
            <Route index element={<AdminDashboardContent userName={user?.name || 'Admin'} />} />
            <Route path="add-student" element={<AddStudent />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="student-list" element={<StudentList />} />
            <Route path="course-list" element={<CourseList />} />
            <Route path="add-library" element={<AddLibrary />} />
            <Route path="book-list" element={<BookList />} />
            <Route path="profile" element={<Profile />} />
            <Route path="teacher-management" element={<TeacherManagement />} />
            <Route path="settings" element={<SettingsProfile />} />
          </Route>
        </Route>
        <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
          <Route path="/components/teacher" element={<TeacherDashboard />}>
            <Route index element={<TeacherDashboardContent userName={user?.name || 'Teacher'} />} />
            <Route path="attendance" element={<AttendanceManager />} />
            <Route path="grade-management" element={<GradeManager />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings-profile" element={<SettingProfile />} />
            <Route path="exam" element={<Exams />} />
            <Route path="assignments" element={<Assignments />} />
          </Route>
        </Route>
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route path="/components/student" element={<StudentDashboard />}>
            <Route index element={<Dashboard userName={user?.name || 'Student'} studId={user?.id || ''} />} />
            <Route path="course-registration" element={<CourseRegistration />} />
            <Route path="grades" element={<ViewGrades />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="attendance" element={<ViewAttendance />} />
            <Route path="exam-schedule" element={<ExamSchedule />} />
            <Route path="schedule" element={<ClassSchedule />} />
            <Route path="chat" element={<Communication />} />
            <Route path="settings-profile" element={<SettingsProfile />} />
          </Route>
        </Route>
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

*/

/*

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import SignIn from './components/auth/Signin';
import AdminDashboard from './components/admin/adminDashboard';
import AddStudent from './components/admin/AddStudent';
import AddCourse from './components/admin/AddCourse';
import StudentList from './components/admin/StudentList';
import CourseList from './components/admin/CourseList';
import AddLibrary from './components/admin/addLibrary';
import BookList from './components/admin/BookList';
import TeacherManagement from './components/admin/TeacherManagement';
import Profile from './components/admin/Profile';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import Dashbord from './components/teacher/TeacherDashboardContent';
import AttendanceManager from './components/teacher/AttendanceManager';
import GradeManager from './components/teacher/GradeManager';
import Chat from './components/teacher/Chat';
import SettingProfil from './components/teacher/setting & profil';
import Exams from './components/teacher/Exams';
import Assignments from './components/teacher/Assignments';
import Dashboard from './components/student/Dashboard';
import CourseRegistration from './components/student/CourseRegistration';
import ViewGrades from './components/student/ViewGrades';
import ViewAttendance from './components/student/ViewAttendance';
import StudentDashboard from './components/student/StudentDashbored';
import ExamSchedule from './components/student/ExamSchedule';
import ClassSchedule from './components/student/ClassSchedule';
import Communication from './components/student/Communication';
import SettingsProfile from './components/student/SettingsProfile';
const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToSignIn = () => setIsLogin(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLogin ? (
              <Login switchToSignIn={switchToSignIn} />
            ) : (
              <SignIn switchToLogin={switchToLogin} />
            )
          }
        />
        <Route path="/components/admin" element={<AdminDashboard />}>
          <Route index element={<div className="p-6 text-2xl font-bold text-blue-800">Welcome to Admin Dashboard</div>} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="student-list" element={<StudentList />} />
          <Route path="course-list" element={<CourseList />} />
          <Route path="add-library" element={<AddLibrary />} />
          <Route path="book-list" element={<BookList />} />
          <Route path="/components/admin/settings" element={<div>Settings Page (Placeholder)</div>} />
         <Route path="/components/admin/profile" element={<Profile/>} />
          <Route path="teacher-management" element={<TeacherManagement />} />
          <Route path="settings" element={<div className="p-6 text-2xl font-bold text-blue-800">Settings & Profile</div>} />
        </Route>
        <Route path='/components/teacher' element={<TeacherDashboard/>}>
        <Route path='/components/teacher/' element={<Dashbord/>}/>
      <Route path='/components/teacher/attendance' element={<AttendanceManager/>}/>
      <Route path='/components/teacher/grade-management' element={<GradeManager/>}/>
        <Route path='/components/teacher/chat' element={<Chat/>}/>
    <Route path='/components/teacher/settings-profile' element={<SettingProfil/>}/>
    <Route path='/components/teacher/exam' element={<Exams/>}/>
       <Route  path='/components/teacher/assignments' element={<Assignments/>}/>
    </Route >
    <Route path="/components/student" element={<StudentDashboard />}>
          <Route index element={<Dashboard />} />
          <Route path="course-registration" element={<CourseRegistration />} />
          <Route path="grades" element={<ViewGrades />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="attendance" element={<ViewAttendance />} />
          <Route path="exam-schedule" element={<ExamSchedule />} />
          <Route path="schedule" element={<ClassSchedule />} />
          <Route path="chat" element={<Communication />} />
          <Route path="settings-profile" element={<SettingsProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
*/