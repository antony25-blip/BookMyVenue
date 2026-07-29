const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Venue = require("../models/Venue");
const fs = require("fs");
const path = require("path");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bookmyvenue";

const ownersData = [
  {
    name: "Kerala Banquets Ltd",
    email: "keralabanquets@gmail.com",
    password: "password123",
    role: "venue_owner",
    phone: "9846012345",
    address: "Vyttila, Kochi, Kerala",
  },
  {
    name: "TechnoSpaces Co",
    email: "technospaces@gmail.com",
    password: "password123",
    role: "venue_owner",
    phone: "9447054321",
    address: "Kazhakkoottam, Trivandrum, Kerala",
  },
  {
    name: "Malabar Hospitality Group",
    email: "malabarresorts@gmail.com",
    password: "password123",
    role: "venue_owner",
    phone: "9946098765",
    address: "East Hill, Calicut, Kerala",
  },
];

const venuesData = [
  {
    ownerEmail: "keralabanquets@gmail.com",
    name: "Royal Grand Ballroom",
    location: "Kochi",
    address: "Near Vyttila Mobility Hub, Kochi, Kerala",
    description: "A luxury ballroom perfect for premium weddings, receptions, and grand corporate events. Fully air-conditioned with seating capacity of 500+ and modern lighting equipment.",
    capacity: 600,
    category: "Birthday Hall",
    pricePerHour: 3500,
    pricePerDay: 25000,
    openTime: "08:00",
    closeTime: "23:00",
    gapHours: 2,
    amenities: ["AC", "WiFi", "Sound System", "Stage", "Parking", "Catering Kitchen"],
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800"
    ],
    license: "/uploads/license-royal-grand.pdf",
    isApproved: false, // Pending Approval
  },
  {
    ownerEmail: "technospaces@gmail.com",
    name: "Technopark Meetup Hub",
    location: "Trivandrum",
    address: "Phase 3, Technopark, Trivandrum, Kerala",
    description: "State-of-the-art auditorium and meetup space equipped with 4K projectors, high-speed fiber internet, and collaborative seating layout. Ideal for hackathons, tech talks, and product launches.",
    capacity: 120,
    category: "Meetup Space",
    pricePerHour: 1200,
    pricePerDay: 8000,
    openTime: "09:00",
    closeTime: "21:00",
    gapHours: 1,
    amenities: ["WiFi", "AC", "Projector", "Whiteboard", "Coffee Machine", "Sound System"],
    images: [
      "/uploads/technopark_meetup.png",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
    ],
    license: "/uploads/license-techno-meetup.pdf",
    isApproved: false, // Pending Approval
  },
  {
    ownerEmail: "malabarresorts@gmail.com",
    name: "Malabar Heritage Auditorium",
    location: "Calicut",
    address: "PT Usha Road, Calicut, Kerala",
    description: "Classic high-capacity auditorium steeped in heritage style. Includes central AC, broad stage area, theatrical seating arrangements, and massive green rooms for performances.",
    capacity: 800,
    category: "Auditorium",
    pricePerHour: 5000,
    pricePerDay: 45000,
    openTime: "07:00",
    closeTime: "22:00",
    gapHours: 3,
    amenities: ["Stage", "Sound System", "AC", "Green Rooms", "Broadband", "Massive Parking"],
    images: [
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800"
    ],
    license: "/uploads/license-malabar-heritage.pdf",
    isApproved: true, // Approved & Live
  },
  {
    ownerEmail: "keralabanquets@gmail.com",
    name: "Lakeview Kumarakom Resort Space",
    location: "Kottayam",
    address: "Kumarakom, Kottayam, Kerala",
    description: "A breathtaking lakeside open lawn and banquet hall. Capturing the tranquility of Vembanad Lake, it's the premium destination for destination weddings, luxury parties, and retreats.",
    capacity: 350,
    category: "Resort",
    pricePerHour: 8000,
    pricePerDay: 60000,
    openTime: "06:00",
    closeTime: "23:00",
    gapHours: 4,
    amenities: ["Swimming Pool", "Lakeside View", "AC", "WiFi", "Outdoor Catering", "Cottage Rooms"],
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800"
    ],
    license: "/uploads/license-lakeview-resort.pdf",
    isApproved: false, // Pending Approval
  },
  {
    ownerEmail: "malabarresorts@gmail.com",
    name: "The Coffee Club Cafe Hall",
    location: "Thrissur",
    address: "Round North, Thrissur, Kerala",
    description: "A cozy modern cafe event space with a mezzanine floor. Perfect for music gigs, reading clubs, poetry slams, and small birthday gatherings.",
    capacity: 45,
    category: "Cafe",
    pricePerHour: 900,
    pricePerDay: 6000,
    openTime: "10:00",
    closeTime: "22:00",
    gapHours: 1,
    amenities: ["WiFi", "AC", "Cafe Counter", "Projector", "Bluetooth Sound"],
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800"
    ],
    license: "/uploads/license-coffee-club.pdf",
    isApproved: true, // Approved & Live
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[SEED] Connected to MongoDB at:", MONGO_URI);

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. Create mock license files
    const mockLicenses = [
      "license-royal-grand.pdf",
      "license-techno-meetup.pdf",
      "license-malabar-heritage.pdf",
      "license-lakeview-resort.pdf",
      "license-coffee-club.pdf"
    ];

    const pdfTemplate = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.275 841.889] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 73 >>
stream
BT
/F1 12 Tf
72 712 Td
(Mock License Document for BookMyVenue Vetting Verification) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000130 00000 n 
0000000244 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
368
%%EOF`;

    for (const lic of mockLicenses) {
      const filePath = path.join(uploadsDir, lic);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, pdfTemplate, "utf8");
        console.log(`[SEED] Created mock license PDF: ${lic}`);
      }
    }

    // 2. Create owners
    const ownersMap = {};
    for (const ownerData of ownersData) {
      const existingUser = await User.findOne({ email: ownerData.email });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ownerData.password, salt);
        
        const user = await User.create({
          ...ownerData,
          password: hashedPassword,
        });
        ownersMap[ownerData.email] = user._id;
        console.log(`[SEED] Owner account created: ${ownerData.name} (${ownerData.email})`);
      } else {
        ownersMap[ownerData.email] = existingUser._id;
        console.log(`[SEED] Owner account already exists: ${ownerData.email}`);
      }
    }

    // 3. Create venues
    for (const venueData of venuesData) {
      const existingVenue = await Venue.findOne({ name: venueData.name });
      if (!existingVenue) {
        const ownerId = ownersMap[venueData.ownerEmail];
        if (ownerId) {
          const { ownerEmail, ...data } = venueData;
          await Venue.create({
            ...data,
            owner: ownerId,
          });
          console.log(`[SEED] Venue created: ${venueData.name} (Owner: ${venueData.ownerEmail})`);
        }
      } else {
        console.log(`[SEED] Venue already exists: ${venueData.name}`);
      }
    }

    console.log("[SEED] Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[SEED] Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
