import mongoose from "mongoose";

import { connectToDatabase, disconnectFromDatabase } from "./mongodb.js";
import { ChatModel } from "./models/ChatModel.js";
import { UserModel } from "./models/UserModel.js";

// Dummy data for initial users, five for recruiters and five for applicants
const DUMMY_USERS = [
  {
    userName: "recruiter1",
    userPassword: "password1",
    userType: "recruiter",
    email: "recruiter1@example.com",
    salary: 50000,
    company: "Tech Corp",
    jobPosition: "Software Engineer",
    description: "Experienced software engineer with a passion for building scalable applications.",
  },
  {
    userName: "recruiter2",
    userPassword: "password2",
    userType: "recruiter",
    email: "recruiter2@example.com",
    salary: 60000,
    company: "Tech Corp",
    jobPosition: "Product Manager",
    description: "Product manager with a track record of successful product launches.",
  },
  {
    userName: "recruiter3",
    userPassword: "password3",
    userType: "recruiter",
    email: "recruiter3@example.com",
    salary: 70000,
    company: "Tech Corp",
    jobPosition: "Data Scientist",
    description: "Data scientist with expertise in machine learning and data analysis.",
  },
  {
    userName: "recruiter4",
    userPassword: "password4",
    userType: "recruiter",
    email: "recruiter4@example.com",
    salary: 80000,
    company: "Tech Corp",
    jobPosition: "UX Designer",
    description: "UX designer with a focus on user-centered design and usability testing.",
  },
  {
    userName: "recruiter5",
    userPassword: "password5",
    userType: "recruiter",
    email: "recruiter5@example.com",
    salary: 90000,
    company: "Tech Corp",
    jobPosition: "Marketing Manager",
    description: "Marketing manager with experience in digital marketing and brand strategy.",
  },
  {
    userName: "applicant1",
    userPassword: "password1",
    userType: "applicant",
    avatar: "https://example.com/avatar1.jpg",
    email: "applicant1@example.com",
    education: ["Bachelor's in Computer Science"],
    experience: ["2 years in software development"],
    skills: ["JavaScript", "React", "Node.js"],
    address: "123 Main St, City, Country",
    phone: "123-456-7890",
  },
  {
    userName: "applicant2",
    userPassword: "password2",
    userType: "applicant",
    avatar: "https://example.com/avatar2.jpg",
    email: "applicant2@example.com",
    education: ["Master's in Business Administration"],
    experience: ["3 years in product management"],
    skills: ["Agile", "Scrum", "Product Strategy"],
    address: "456 Elm St, City, Country",
    phone: "987-654-3210",
  },
  {
    userName: "applicant3",
    userPassword: "password3",
    userType: "applicant",
    avatar: "https://example.com/avatar3.jpg",
    email: "applicant3@example.com",
    education: ["Bachelor's in Data Science"],
    experience: ["4 years in data analysis"],
    skills: ["Python", "Machine Learning", "SQL"],
    address: "789 Oak St, City, Country",
    phone: "456-789-1230",
  },
  {
    userName: "applicant4",
    userPassword: "password4",
    userType: "applicant",
    avatar: "https://example.com/avatar4.jpg",
    email: "applicant4@example.com",
    education: ["Bachelor's in Design"],
    experience: ["5 years in UX design"],
    skills: ["Figma", "User Research", "Prototyping"],
    address: "321 Pine St, City, Country",
    phone: "321-654-9870",
  },
  {
    userName: "applicant5",
    userPassword: "password5",
    userType: "applicant",
    avatar: "https://example.com/avatar5.jpg",
    email: "applicant5@example.com",
    education: ["Master's in Marketing"],
    experience: ["3 years in digital marketing"],
    skills: ["SEO", "Content Marketing", "Social Media"],
    address: "654 Cedar St, City, Country",
    phone: "654-321-0987",
  },
];

const LOREM = [
  // Not words
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus.",
  "Nulla gravida orci a odio.",
  "Nullam varius, turpis et commodo pharetra, est eros bibendum elit.",
  "Aenean ut eros et nisl sagittis vestibulum.",
  "In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.",
  "In enim justo, rhoncus ut, imperdiet a, venenatis vitae",
  "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.",
  "Aliquam erat volutpat.",
  "Phasellus iaculis neque.",
  "Phasellus leo dolor, tempus non, auctor et, hendrerit quis.",
  "In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
  "Et harum quidem rerum facilis est et expedita distinctio.",
  "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
  "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
];

async function initDatabase() {
  await connectToDatabase();

  await ChatModel.deleteMany({}); // Clear existing chats
  await UserModel.deleteMany({}); // Clear existing users

  const userResult = await UserModel.insertMany(DUMMY_USERS); // Insert new dummy users
  console.log(`💬 ${userResult.length} dummy users created! 💬`);

  const userIds = await UserModel.find({}, "_id").lean();
  const randomChats = createRandomChats(userIds);
  const chatResult = await ChatModel.insertMany(randomChats);
  console.log(`💬 ${chatResult.length} random chats created! 💬`);

  console.log("✨Database initialized done!✨");

  await disconnectFromDatabase();
}

initDatabase();

function createRandomChats(userIds) {
  const randomChats = [];
  for (let i = 0; i < LOREM.length * 5; i++) {
    const randomMessage = LOREM[Math.floor(Math.random() * LOREM.length)];
    // randomly choose two different users to create a chat
    const randomUser1 = userIds[Math.floor(Math.random() * userIds.length)];
    let randomUser2 = userIds[Math.floor(Math.random() * userIds.length)];
    while (randomUser1 == randomUser2) {
      randomUser2 = userIds[Math.floor(Math.random() * userIds.length)];
    }
    randomChats.push({
      from: randomUser1._id,
      to: randomUser2._id,
      chatID: `${randomUser1}-${randomUser2}`,
      message: randomMessage,
    });
  }
  return randomChats;
}
