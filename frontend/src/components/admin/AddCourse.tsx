
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBook, FaIdCard, FaUser, FaUsers, FaInfoCircle, FaBuilding, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface CourseProperty {
  courseCode: string;
  courseName: string;
  description: string;
  teacherId: string;
  enrolledStudents: string[];
  department: string;
}

interface Student {
  studId: string;
  studName: string;
}

interface Teacher {
  teacherId: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  hireDate: string;
  position: string;
  coursesAssigned: string[];
  status: string;
}

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState<CourseProperty>({
    courseCode: "",
    courseName: "",
    description: "",
    teacherId: "",
    enrolledStudents: [],
    department: "",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [errors, setErrors] = useState<Partial<CourseProperty>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        console.log("Fetching teachers...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher-list`);
        console.log("Teachers fetched:", response.data);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid teacher data format: Expected an array");
        }
        setTeachers(response.data);
      } catch (error: any) {
        console.error("Failed to fetch teachers:", error);
        setFetchError("Failed to load teacher list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      setLoading(true);
      try {
        console.log("Fetching students...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student-list`);
        console.log("Students fetched:", response.data);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid student data format: Expected an array");
        }
        setStudents(response.data);
      } catch (error: any) {
        console.error("Failed to fetch students:", error);
        setFetchError("Failed to load student list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
    fetchStudents();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<CourseProperty> = {};
    if (!courseInfo.courseCode?.trim()) newErrors.courseCode = "Course code is required";
    else if (courseInfo.courseCode.length < 4) newErrors.courseCode = "Course code must be at least 4 characters";
    if (!courseInfo.courseName?.trim()) newErrors.courseName = "Course name is required";
    else if (courseInfo.courseName.length < 2) newErrors.courseName = "Course name must be at least 2 characters";
    if (!courseInfo.description?.trim()) newErrors.description = "Course description is required";
    else if (courseInfo.description.length < 10) newErrors.description = "Description must be at least 10 characters";
    if (!courseInfo.teacherId) newErrors.teacherId = "Teacher selection is required";
    if (!courseInfo.department) newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CourseProperty]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStudentsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setCourseInfo((prev) => ({ ...prev, enrolledStudents: selectedOptions }));
    if (errors.enrolledStudents) {
      setErrors((prev) => ({ ...prev, enrolledStudents: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmission = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      console.log("Submitting course:", courseInfo);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/addCourse`, courseInfo);
      setShowSuccessToast(true);
      setCourseInfo({
        courseCode: "",
        courseName: "",
        description: "",
        teacherId: "",
        enrolledStudents: [],
        department: "",
      });
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Error adding course:", error);
      const errorMessage = error.response?.data?.message || "Failed to add course. Please try again.";
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setFetchError(null);
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        console.log("Retrying fetch teachers...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher-list`);
        console.log("Teachers fetched:", response.data);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid teacher data format: Expected an array");
        }
        setTeachers(response.data);
      } catch (error: any) {
        console.error("Failed to fetch teachers:", error);
        setFetchError("Failed to load teacher list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      setLoading(true);
      try {
        console.log("Retrying fetch students...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student-list`);
        console.log("Students fetched:", response.data);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid student data format: Expected an array");
        }
        setStudents(response.data);
      } catch (error: any) {
        console.error("Failed to fetch students:", error);
        setFetchError("Failed to load student list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
    fetchStudents();
  };

  const resetForm = () => {
    setCourseInfo({
      courseCode: "",
      courseName: "",
      description: "",
      teacherId: "",
      enrolledStudents: [],
      department: "",
    });
    setErrors({});
    navigate("/components/admin");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaBook className="mr-2" />
          Course added successfully!
        </div>
      )}
      {showErrorToast && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {showErrorToast}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      {fetchError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {fetchError}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Confirm Submission</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to add this course?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                onClick={confirmSubmission}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">Add New Course</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaIdCard className="mr-2 text-blue-600" /> Course Code
                </label>
                <input
                  id="courseCode"
                  name="courseCode"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.courseCode ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.courseCode}
                  onChange={handleChange}
                  placeholder="Enter unique course code (e.g., CS101)"
                  required
                />
                {errors.courseCode && <p className="text-red-500 text-sm mt-1">{errors.courseCode}</p>}
              </div>
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaBook className="mr-2 text-blue-600" /> Course Name
                </label>
                <input
                  id="courseName"
                  name="courseName"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.courseName ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.courseName}
                  onChange={handleChange}
                  placeholder="Enter course name"
                  required
                />
                {errors.courseName && <p className="text-red-500 text-sm mt-1">{errors.courseName}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-600" /> Description
              </label>
              <textarea
                id="description"
                name="description"
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                value={courseInfo.description}
                onChange={handleChange}
                placeholder="Enter course description"
                rows={4}
                required
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-blue-600" /> Teacher
                </label>
                <select
                  id="teacherId"
                  name="teacherId"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.teacherId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.teacherId}
                  onChange={handleChange}
                  required
                  disabled={teachers.length === 0}
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.name} ({teacher.teacherId})
                    </option>
                  ))}
                </select>
                {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
                {teachers.length === 0 && !loading && !fetchError && (
                  <p className="text-gray-600 text-sm mt-1">No teachers available. Add teachers via Teacher Management page.</p>
                )}
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaBuilding className="mr-2 text-blue-600" /> Department
                </label>
                <select
                  id="department"
                  name="department"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.department ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="enrolledStudents" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaUsers className="mr-2 text-blue-600" /> Enrolled Students
              </label>
              <select
                id="enrolledStudents"
                name="enrolledStudents"
                multiple
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.enrolledStudents ? "border-red-500" : "border-gray-300"
                }`}
                value={courseInfo.enrolledStudents}
                onChange={handleStudentsChange}
                disabled={students.length === 0}
              >
                {students.length === 0 ? (
                  <option value="" disabled>No students available</option>
                ) : (
                  students.map((student) => (
                    <option key={student.studId} value={student.studId}>
                      {student.studName} ({student.studId})
                    </option>
                  ))
                )}
              </select>
              {errors.enrolledStudents && <p className="text-red-500 text-sm mt-1">{errors.enrolledStudents}</p>}
              {students.length === 0 && !loading && !fetchError && (
                <p className="text-gray-600 text-sm mt-1">No students available. Add students via Add Student page.</p>
              )}
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-300"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                  (isSubmitting || loading) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Add Course"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddCourse;

/*
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBook, FaIdCard, FaUser, FaUsers, FaInfoCircle, FaBuilding, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface CourseProperty {
  courseCode?: string;
  courseName?: string;
  description?: string;
  teacherId?: string;
  enrolledStudents?: string[];
  department?: string;
}

interface Student {
  studId: string;
  studName: string;
}

const teachers = [
  { id: "T001", name: "Dr. Abebe Kebede" },
  { id: "T002", name: "Prof. Mulugeta Tesfaye" },
  { id: "T003", name: "Ms. Selamawit Desta" },
];

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState<CourseProperty>({
    courseCode: "",
    courseName: "",
    description: "",
    teacherId: "",
    enrolledStudents: [],
    department: "",
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [errors, setErrors] = useState<Partial<CourseProperty>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        console.log("Fetching students...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student-list`);
        console.log("Students fetched:", response.data);
        setStudents(response.data);
      } catch (error: any) {
        console.error("Failed to fetch students:", error);
        setFetchError("Failed to load student list. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<CourseProperty> = {};
    if (!courseInfo.courseCode?.trim()) newErrors.courseCode = "Course code is required";
    else if (courseInfo.courseCode.length < 4) newErrors.courseCode = "Course code must be at least 4 characters";
    if (!courseInfo.courseName?.trim()) newErrors.courseName = "Course name is required";
    else if (courseInfo.courseName.length < 2) newErrors.courseName = "Course name must be at least 2 characters";
    if (!courseInfo.description?.trim()) newErrors.description = "Course description is required";
    else if (courseInfo.description.length < 10) newErrors.description = "Description must be at least 10 characters";
    if (!courseInfo.teacherId) newErrors.teacherId = "Teacher selection is required";
    if (!courseInfo.department) newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CourseProperty]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStudentsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setCourseInfo((prev) => ({ ...prev, enrolledStudents: selectedOptions }));
    if (errors.enrolledStudents) {
      setErrors((prev) => ({ ...prev, enrolledStudents: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmission = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      console.log("Submitting course:", courseInfo);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/addCourse`, courseInfo);
      setShowSuccessToast(true);
      setCourseInfo({
        courseCode: "",
        courseName: "",
        description: "",
        teacherId: "",
        enrolledStudents: [],
        department: "",
      });
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Error adding course:", error);
      const errorMessage = error.response?.data?.message || "Failed to add course. Please try again.";
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setFetchError(null);
    const fetchStudents = async () => {
      setLoading(true);
      try {
        console.log("Retrying fetch students...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student-list`);
        console.log("Students fetched:", response.data);
        setStudents(response.data);
      } catch (error: any) {
        console.error("Failed to fetch students:", error);
        setFetchError("Failed to load student list. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  };

  const resetForm = () => {
    setCourseInfo({
      courseCode: "",
      courseName: "",
      description: "",
      teacherId: "",
      enrolledStudents: [],
      department: "",
    });
    setErrors({});
    navigate("/components/admin");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaBook className="mr-2" />
          Course added successfully!
        </div>
      )}
      {showErrorToast && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {showErrorToast}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      {fetchError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {fetchError}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Confirm Submission</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to add this course?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                onClick={confirmSubmission}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">Add New Course</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaIdCard className="mr-2 text-blue-600" /> Course Code
                </label>
                <input
                  id="courseCode"
                  name="courseCode"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.courseCode ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.courseCode}
                  onChange={handleChange}
                  placeholder="Enter unique course code (e.g., CS101)"
                  required
                />
                {errors.courseCode && <p className="text-red-500 text-sm mt-1">{errors.courseCode}</p>}
              </div>
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaBook className="mr-2 text-blue-600" /> Course Name
                </label>
                <input
                  id="courseName"
                  name="courseName"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.courseName ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.courseName}
                  onChange={handleChange}
                  placeholder="Enter course name"
                  required
                />
                {errors.courseName && <p className="text-red-500 text-sm mt-1">{errors.courseName}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-600" /> Description
              </label>
              <textarea
                id="description"
                name="description"
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                value={courseInfo.description}
                onChange={handleChange}
                placeholder="Enter course description"
                rows={4}
                required
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-blue-600" /> Teacher
                </label>
                <select
                  id="teacherId"
                  name="teacherId"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.teacherId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.teacherId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.id})
                    </option>
                  ))}
                </select>
                {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaBuilding className="mr-2 text-blue-600" /> Department
                </label>
                <select
                  id="department"
                  name="department"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.department ? "border-red-500" : "border-gray-300"
                  }`}
                  value={courseInfo.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="enrolledStudents" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaUsers className="mr-2 text-blue-600" /> Enrolled Students
              </label>
              <select
                id="enrolledStudents"
                name="enrolledStudents"
                multiple
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.enrolledStudents ? "border-red-500" : "border-gray-300"
                }`}
                value={courseInfo.enrolledStudents}
                onChange={handleStudentsChange}
                disabled={students.length === 0}
              >
                {students.length === 0 ? (
                  <option value="" disabled>No students available</option>
                ) : (
                  students.map((student) => (
                    <option key={student.studId} value={student.studId}>
                      {student.studName} ({student.studId})
                    </option>
                  ))
                )}
              </select>
              {errors.enrolledStudents && <p className="text-red-500 text-sm mt-1">{errors.enrolledStudents}</p>}
              {students.length === 0 && !loading && !fetchError && (
                <p className="text-gray-600 text-sm mt-1">No students available. Add students via Add Student page.</p>
              )}
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-300"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                  (isSubmitting || loading) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Add Course"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddCourse;
*/