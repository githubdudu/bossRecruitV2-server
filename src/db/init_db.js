import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { connectToDatabase, disconnectFromDatabase } from "./mongodb.js";
import { MessageModel } from "./models/MessageModel.js";
import { ConversationModel } from "./models/ConversationModel.js";
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

  await MessageModel.deleteMany({}); // Clear existing messages
  await ConversationModel.deleteMany({}); // Clear existing conversations
  await UserModel.deleteMany({}); // Clear existing users

  // Hash passwords for dummy users
  const hashedUsers = await Promise.all(
    DUMMY_USERS.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.userPassword = await bcrypt.hash(user.userPassword, salt);
      return user;
    }),
  );

  const userResult = await UserModel.insertMany(hashedUsers); // Insert new dummy users
  console.log(`💬 ${userResult.length} dummy users created! 💬`);

  const recruiters = await UserModel.find({ userType: "recruiter" }).lean();
  const applicants = await UserModel.find({ userType: "applicant" }).lean();

  const randomMessages = await createRandomMessages(recruiters, applicants);
  // disable auto timestamps
  const messageResult = await MessageModel.insertMany(randomMessages, { timestamps: false });

  const conversationCounts = await ConversationModel.countDocuments();
  console.log(
    `💬 ${messageResult.length} random messages created in ${conversationCounts} conversations! 💬`,
  );

  console.log("✨Database initialized done!✨");

  await disconnectFromDatabase();
}

initDatabase();

async function createRandomMessages(recruiters, applicants) {
  const randomMessages = [];
  const aDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  //  Chronological timestamps generator
  const nextRandomTime = getRandomTimeFrom(aDayAgo);

  for (let i = 0; i < LOREM.length * 5; i++) {
    const randomText = LOREM[Math.floor(Math.random() * LOREM.length)];

    const [randomRecruiterId, randomApplicantId] = createRandomParticipants(recruiters, applicants);
    const conversationId = await findOrCreateConversation(randomRecruiterId, randomApplicantId);

    // Create chronological timestamps
    const createdAt = nextRandomTime();
    randomMessages.push({
      senderId: Math.random() < 0.5 ? randomRecruiterId : randomApplicantId,
      conversationId: conversationId,
      text: randomText,
      createdAt: createdAt,
      updatedAt: createdAt,
    });
  }
  return randomMessages;
}

/** * Select random recruiters and applicants.
 * @param {Array} recruiters - Array of recruiter user objects.
 * @param {Array} applicants - Array of applicant user objects.
 * @returns {Array<mongoose.Types.ObjectId>} Array containing recruiter ID and applicant ID.
 */
function createRandomParticipants(recruiters, applicants) {
  const randomRecruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
  const randomApplicant = applicants[Math.floor(Math.random() * applicants.length)];
  return [randomRecruiter._id, randomApplicant._id];
}

/**
 * Atomically finds a conversation or creates it if it doesn't exist.
 * Does NOT update the conversation if it already exists.
 * @param {mongoose.Types.ObjectId} recruiterId
 * @param {mongoose.Types.ObjectId} applicantId
 * @returns {Promise<mongoose.Types.ObjectId>} The _id of the found or created conversation.
 */
async function findOrCreateConversation(recruiterId, applicantId) {
  // 1. The Filter
  // Sorting ensures that the order of participants doesn't matter.
  const participantsArray = [recruiterId, applicantId].sort();
  const _id = participantsArray.join("_");

  const filter = {
    _id: _id,
  };

  // 2. The Update: This is the key part.
  // An empty update `{}` means "do nothing" if the document is found.
  // `$setOnInsert` specifies the data to use ONLY when a new document is created.
  const update = {
    $setOnInsert: {
      _id: _id,
      participants: participantsArray,
    },
  };

  // 3. The Options:
  const options = {
    upsert: true, // Create the document if it doesn't exist.
    returnDocument: "after", // Return the document after the update.
    setDefaultsOnInsert: true, // Apply schema defaults on creation.
  };

  const conversation = await ConversationModel.findOneAndUpdate(filter, update, options);

  return conversation._id;
}

/**
 * Generates a random timestamp starting from the given date.
 * The function maintains an internal state to incrementally generate
 * random timestamps within a 1-hour period from the last generated time.
 *
 * @param {Date|string} start - The starting date or timestamp.
 * @param {number} [period=3600000] - The period in milliseconds to generate random timestamps.
 * @returns {Object} An object with a `next` method to get the next random timestamp.
 */
function getRandomTimeFrom(start, period = 60 * 60 * 1000) {
  let startTime = new Date(start);

  return function next() {
    const randomOffset = Math.floor(Math.random() * period) + 1000;
    startTime = new Date(startTime.getTime() + randomOffset);
    return startTime;
  };
}
