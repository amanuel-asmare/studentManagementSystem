const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

//const uri = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb://amanu:todo1234sample@ac-bgdsklo-shard-00-00.d28ajju.mongodb.net:27017,ac-bgdsklo-shard-00-01.d28ajju.mongodb.net:27017,ac-bgdsklo-shard-00-02.d28ajju.mongodb.net:27017/?ssl=true&replicaSet=atlas-1qk08g-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Clustertodo"
const client = new MongoClient(uri);

async function seedDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const db = client.db("StudentManagementSystem");
        const userCollection = db.collection("users");
        const teacherCollection = db.collection("students");
        const studentCollection = db.collection("teachers");

        // Clear existing data (optional)
        await Promise.all([
            userCollection.deleteMany({}),
            teacherCollection.deleteMany({}),
            studentCollection.deleteMany({}),
        ]);
        console.log("Cleared existing data");

        // Hash passwords
        const adminPassword = await bcrypt.hash("admin123456", 10);
        const teacherPassword = await bcrypt.hash("teacher123456", 10);
        const studentPassword = await bcrypt.hash("student123456", 10);

        // Sample Admin (User collection only)
        const admin = {
            name: "aman User",
            email: "aman@university.com",
            password: adminPassword,
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Sample Teacher (User and Teacher collections)
        const teacher = {
            teacherId: "T001",
            name: "John Doe",
            department: "Computer Science",
            email: "john.doe@university.com",
            phone: "+251912345678",
            salary: 50000,
            hireDate: new Date("2023-01-15"),
            position: "Professor",
            coursesAssigned: ["CS101", "CS202"],
            status: "Active",
            password: teacherPassword,
        };
        const teacherUser = {
            name: teacher.name,
            email: teacher.email,
            password: teacherPassword,
            role: "teacher",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Sample Student (User and Student collections)
        const student = {
            studId: "CS_STU_001",
            studName: "Jane Smith",
            email: "jane.smith@university.com",
            phone: "+251987654321",
            region: "Addis Ababa",
            gradeLevel: "3",
            gender: "Female",
            enrolledCourses: [
                { courseCode: "CS101", enrollmentDate: new Date(), status: "Enrolled" },
                { courseCode: "CS202", enrollmentDate: new Date(), status: "Enrolled" },
            ],
            registrationDate: new Date("2023-09-01").toISOString(),
            password: studentPassword,
            department: "Computer Science",
            batch: "2015 E.C.",
            semester: "Semester 1",
        };
        const studentUser = {
            name: student.studName,
            email: student.email,
            password: studentPassword,
            role: "student",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await userCollection.insertOne(admin);
        console.log("Admin inserted into User collection");

        await Promise.all([
            userCollection.insertOne(teacherUser),
            teacherCollection.insertOne(teacher),
        ]);
        console.log("Teacher inserted into User and Teacher collections");

        await Promise.all([
            userCollection.insertOne(studentUser),
            studentCollection.insertOne(student),
        ]);
        console.log("Student inserted into User and Student collections");

    } catch (error) {
        console.error("Error seeding database:", error.message, error.stack);
    } finally {
        await client.close();
        console.log("Disconnected from MongoDB Atlas");
    }
}

seedDatabase();