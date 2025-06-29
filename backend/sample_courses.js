// Run in MongoDB shell or with MongoDB Compass to insert sample courses for all departments
db.courses.insertMany([{
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        description: "Basics of programming using Python",
        teacherId: "T001",
        enrolledStudents: [],
        department: "Computer Science"
    },
    {
        courseCode: "CS102",
        courseName: "Data Structures",
        description: "Fundamental data structures and algorithms",
        teacherId: "T002",
        enrolledStudents: [],
        department: "Computer Science"
    },
    {
        courseCode: "CE101",
        courseName: "Structural Analysis",
        description: "Fundamentals of structural engineering",
        teacherId: "T003",
        enrolledStudents: [],
        department: "Civil Engineering"
    },
    {
        courseCode: "EE101",
        courseName: "Circuit Theory",
        description: "Introduction to electrical circuits",
        teacherId: "T004",
        enrolledStudents: [],
        department: "Electrical Engineering"
    },
    {
        courseCode: "ME101",
        courseName: "Mechanics of Materials",
        description: "Study of material properties and mechanics",
        teacherId: "T005",
        enrolledStudents: [],
        department: "Mechanical Engineering"
    },
    {
        courseCode: "MED101",
        courseName: "Introduction to Anatomy",
        description: "Basics of human anatomy",
        teacherId: "T006",
        enrolledStudents: [],
        department: "Medicine"
    },
    {
        courseCode: "LAW101",
        courseName: "Constitutional Law",
        description: "Principles of constitutional law",
        teacherId: "T007",
        enrolledStudents: [],
        department: "Law"
    },
    {
        courseCode: "BA101",
        courseName: "Principles of Management",
        description: "Fundamentals of business management",
        teacherId: "T008",
        enrolledStudents: [],
        department: "Business Administration"
    },
    {
        courseCode: "ECO101",
        courseName: "Microeconomics",
        description: "Introduction to microeconomic principles",
        teacherId: "T009",
        enrolledStudents: [],
        department: "Economics"
    },
    {
        courseCode: "ARCH101",
        courseName: "Architectural Design",
        description: "Basics of architectural design",
        teacherId: "T010",
        enrolledStudents: [],
        department: "Architecture"
    },
    {
        courseCode: "PHAR101",
        courseName: "Pharmacology Basics",
        description: "Introduction to pharmacology",
        teacherId: "T011",
        enrolledStudents: [],
        department: "Pharmacy"
    },
    {
        courseCode: "AGRI101",
        courseName: "Crop Science",
        description: "Fundamentals of crop production",
        teacherId: "T012",
        enrolledStudents: [],
        department: "Agriculture"
    },
    {
        courseCode: "PH101",
        courseName: "Epidemiology",
        description: "Study of disease patterns",
        teacherId: "T013",
        enrolledStudents: [],
        department: "Public Health"
    },
    {
        courseCode: "SW101",
        courseName: "Social Work Practice",
        description: "Introduction to social work methods",
        teacherId: "T014",
        enrolledStudents: [],
        department: "Social Work"
    },
    {
        courseCode: "EDU101",
        courseName: "Educational Psychology",
        description: "Psychological principles in education",
        teacherId: "T015",
        enrolledStudents: [],
        department: "Education"
    }
]);