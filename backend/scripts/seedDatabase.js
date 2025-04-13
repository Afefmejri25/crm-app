import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Client from "../models/Client.js";
import Appointment from "../models/Appointment.js";
import Call from "../models/Call.js";
import Document from "../models/Document.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Client.deleteMany();
    await Appointment.deleteMany();
    await Call.deleteMany();
    await Document.deleteMany();

    console.log("Existing data cleared.");

    // Seed Users with hashed passwords
    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10), // New admin password
        role: "admin",
      },
      {
        name: "Agent User",
        email: "agent@example.com",
        password: await bcrypt.hash("agent123", 10), // New agent password
        role: "agent",
      },
    ]);
    console.log("Users seeded.");

    // Seed Clients
    const clients = await Client.insertMany([
      {
        companyName: "TechCorp",
        contactName: "John Doe",
        email: "john.doe@techcorp.com",
        phone: "123-456-7890",
        address: "123 Tech Street",
        region: "North",
        annualRevenue: 500000,
        createdBy: users[1]._id,
      },
      {
        companyName: "BizSolutions",
        contactName: "Jane Smith",
        email: "jane.smith@bizsolutions.com",
        phone: "987-654-3210",
        address: "456 Biz Avenue",
        region: "South",
        annualRevenue: 750000,
        createdBy: users[1]._id,
      },
      {
        companyName: "Innovatech",
        contactName: "Alice Johnson",
        email: "alice.johnson@innovatech.com",
        phone: "555-123-4567",
        address: "789 Innovation Blvd",
        region: "East",
        annualRevenue: 1000000,
        createdBy: users[1]._id,
      },
    ]);
    console.log("Clients seeded.");

    // Seed Appointments
    const appointments = await Appointment.insertMany([
      {
        title: "Project Kickoff",
        description: "Initial meeting to discuss project requirements.",
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        client: clients[0]._id,
        createdBy: users[1]._id,
        level: "Primary",
        status: "Scheduled",
      },
      {
        title: "Follow-up Call",
        description: "Discuss progress and next steps.",
        start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 1 day later
        end: new Date(new Date().getTime() + 25 * 60 * 60 * 1000), // 1 hour later
        client: clients[1]._id,
        createdBy: users[1]._id,
        level: "Warning",
        status: "Scheduled",
      },
      {
        title: "Contract Review",
        description: "Review the contract with the client.",
        start: new Date(new Date().getTime() + 48 * 60 * 60 * 1000), // 2 days later
        end: new Date(new Date().getTime() + 49 * 60 * 60 * 1000), // 1 hour later
        client: clients[2]._id,
        createdBy: users[1]._id,
        level: "Success",
        status: "Scheduled",
      },
    ]);
    console.log("Appointments seeded.");

    // Seed Calls
    const calls = await Call.insertMany([
      {
        client: clients[0]._id,
        agent: users[1]._id,
        date: new Date(),
        result: "Success",
        notes: "Client is interested in the proposal.",
      },
      {
        client: clients[1]._id,
        agent: users[1]._id,
        date: new Date(),
        result: "No Response",
        notes: "Left a voicemail for the client.",
      },
      {
        client: clients[2]._id,
        agent: users[1]._id,
        date: new Date(),
        result: "Callback Requested",
        notes: "Client requested a callback next week.",
      },
    ]);
    console.log("Calls seeded.");

    // Seed Documents
    const documents = await Document.insertMany([
      {
        title: "Proposal Document",
        description: "Detailed project proposal.",
        type: "PDF",
        fileType: "application/pdf",
        uploadedAt: new Date(),
        fileUrl: "https://example.com/proposal.pdf",
        client: clients[0]._id,
        uploadedBy: users[1]._id,
      },
      {
        title: "Contract Agreement",
        description: "Signed contract agreement.",
        type: "PDF",
        fileType: "application/pdf",
        uploadedAt: new Date(),
        fileUrl: "https://example.com/contract.pdf",
        client: clients[1]._id,
        uploadedBy: users[1]._id,
      },
      {
        title: "Technical Specification",
        description: "Technical details of the project.",
        type: "DOCX",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploadedAt: new Date(),
        fileUrl: "https://example.com/specification.docx",
        client: clients[2]._id,
        uploadedBy: users[1]._id,
      },
    ]);
    console.log("Documents seeded.");

    console.log("Database seeding completed.");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

connectDB().then(seedDatabase);
