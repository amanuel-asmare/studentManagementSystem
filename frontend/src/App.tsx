
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Header from "./components/Header";
// import TeacherManagement from "./components/admin/TeacherManagement";
// import AddCourse from "./components/admin/AddCourse";
// import CourseList from "./components/admin/CourseList";

// const App: React.FC = () => {
//   return (
//     <Router>
//       <div className="flex flex-col min-h-screen">
//         <Header />
//         <main className="flex-grow">
//           <Routes>
//             <Route path="/components/admin/teacher-management" element={<TeacherManagement />} />
//             <Route path="/components/admin/add-course" element={<AddCourse />} />
//             <Route path="/components/admin/course-list" element={<CourseList />} />
            
//             <Route path="/" element={<div>Home Page (Placeholder)</div>} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// };

// export default App;


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
import Dashbord from './components/teacher/Dashbord';
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
