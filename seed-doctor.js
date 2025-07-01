const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Department = require("./models/doctor-appointment");
const Doctor = require("./models/doctor.schema");

dotenv.config();
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

const seedDepartmentsAndDoctors = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    await Department.deleteMany();
    await Doctor.deleteMany();

    const departments = [
      {
        name: "General Physician",
        description: "Primary care and general health consultations.",
        icon: "/icons/general_physician.png",
      },
      {
        name: "Dermatology",
        description: "Skin, hair, and nail related treatments.",
        icon: "/icons/dermatology.png",
      },
      {
        name: "Gynaecology",
        description: "Women's reproductive health services.",
        icon: "/icons/gynaecology.png",
      },
      {
        name: "Orthopaedics",
        description: "Bones, joints, and muscle care.",
        icon: "/icons/orthopaedics.png",
      },
      {
        name: "ENT",
        description: "Ear, nose, and throat consultations.",
        icon: "/icons/ent.png",
      },
      {
        name: "Neurology",
        description: "Brain and nervous system specialists.",
        icon: "/icons/neurology.png",
      },
    ];

    const insertedDepartments = await Department.insertMany(departments);
    console.log(`✅ Inserted ${insertedDepartments.length} departments`);

    // Add doctors to each department
    const doctors = [
      {
        name: "Dr. Divyashree R.A",
        specialization: "General Physician",
        experience: 16,
        rating: 4.6,
        totalRatings: 3888,
        fee: 299,
        image: "/doctors/divyashree.png",
        clinic: {
          name: "City Health Clinic",
          address: "MG Road, Bangalore",
          timings: "Mon-Fri | 9AM-1PM",
          location: "Bangalore",
        },
        departmentId: insertedDepartments.find(
          (dep) => dep.name === "General Physician"
        )._id,
      },
      {
        name: "Dr. Rajeev Nair",
        specialization: "Dermatologist",
        experience: 12,
        rating: 4.7,
        totalRatings: 2150,
        fee: 350,
        image: "/doctors/rajeev.png",
        clinic: {
          name: "Skin Care Centre",
          address: "Andheri West, Mumbai",
          timings: "Mon-Sat | 10AM-2PM",
          location: "Mumbai",
        },
        departmentId: insertedDepartments.find(
          (dep) => dep.name === "Dermatology"
        )._id,
      },
      {
        name: "Dr. Anjali Sharma",
        specialization: "Gynaecologist",
        experience: 14,
        rating: 4.8,
        totalRatings: 3222,
        fee: 400,
        image: "/doctors/anjali.png",
        clinic: {
          name: "Women Wellness Clinic",
          address: "Sector 18, Noida",
          timings: "Tue-Sun | 10AM-3PM",
          location: "Noida",
        },
        departmentId: insertedDepartments.find(
          (dep) => dep.name === "Gynaecology"
        )._id,
      },
      {
        name: "Dr. Raj Malhotra",
        specialization: "Orthopaedic Surgeon",
        experience: 20,
        rating: 4.9,
        totalRatings: 4100,
        fee: 500,
        image: "/doctors/raj.png",
        clinic: {
          name: "Bone & Joint Clinic",
          address: "Sector 12, Gurgaon",
          timings: "Mon-Fri | 10AM-1PM",
          location: "Gurgaon",
        },
        departmentId: insertedDepartments.find(
          (dep) => dep.name === "Orthopaedics"
        )._id,
      },
    ];

    const insertedDoctors = await Doctor.insertMany(doctors);
    console.log(`✅ Inserted ${insertedDoctors.length} doctors`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedDepartmentsAndDoctors();
