import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";

export interface Major {
  id: string;
  name: string;
  category: string;
  description: string;
  related: string[];
  isCustom?: boolean;
}

export interface TopPick {
  id: string;
  majorId: string;
  majorName: string;
  type: "major" | "minor";
  rank: 1 | 2 | 3;
  specificName: string;
  bestColleges: { name: string; reason: string }[];
  whyInterested: string;
  careerGoals: string;
  extraNotes: string;
}

export const majorCategories = [
  "All",
  "Agriculture",
  "Architecture",
  "Arts & Design",
  "Business",
  "Communications",
  "Computer Science",
  "Education",
  "Engineering",
  "Health & Medicine",
  "Humanities",
  "Law & Policy",
  "Mathematics",
  "Natural Sciences",
  "Social Sciences",
  "Custom",
];

export function getAllMajors(): Major[] {
  return [
    // Minors
    {
      id: "minor-art",
      name: "Art",
      category: "Arts & Design",
      description: "Visual arts as a complement to any major.",
      related: ["Graphic Design", "Fine Arts"],
    },
    {
      id: "minor-bio",
      name: "Biology",
      category: "Natural Sciences",
      description: "Life sciences — great with psychology or education.",
      related: ["Pre-Med", "Environmental Science"],
    },
    {
      id: "minor-chem",
      name: "Chemistry",
      category: "Natural Sciences",
      description: "Pairs with engineering and biology.",
      related: ["Biochemistry", "Pharmacy"],
    },
    {
      id: "minor-math",
      name: "Mathematics",
      category: "Mathematics",
      description: "Analytical skills for CS, econ, engineering.",
      related: ["CS", "Physics", "Economics"],
    },
    {
      id: "minor-stat",
      name: "Statistics",
      category: "Mathematics",
      description: "Data skills for any field.",
      related: ["Data Science", "Economics", "Psychology"],
    },
    {
      id: "minor-cs",
      name: "Computer Science",
      category: "Computer Science",
      description: "Coding basics — useful everywhere.",
      related: ["Data Science", "Math", "Engineering"],
    },
    {
      id: "minor-biz",
      name: "Business",
      category: "Business",
      description: "Marketing, management, finance basics.",
      related: ["Marketing", "Finance", "Entrepreneurship"],
    },
    {
      id: "minor-econ",
      name: "Economics",
      category: "Social Sciences",
      description: "Markets and decisions.",
      related: ["Finance", "Data Science", "Public Policy"],
    },
    {
      id: "minor-psych",
      name: "Psychology",
      category: "Social Sciences",
      description: "Human behavior — valuable in marketing, education.",
      related: ["Neuroscience", "Marketing", "Education"],
    },
    {
      id: "minor-soc",
      name: "Sociology",
      category: "Social Sciences",
      description: "Society and culture.",
      related: ["Psychology", "Criminal Justice"],
    },
    {
      id: "minor-eng",
      name: "English",
      category: "Humanities",
      description: "Writing and critical thinking.",
      related: ["Journalism", "Law", "Marketing"],
    },
    {
      id: "minor-phil",
      name: "Philosophy",
      category: "Humanities",
      description: "Logic and ethics — prep for law.",
      related: ["Law", "Political Science"],
    },
    {
      id: "minor-polisci",
      name: "Political Science",
      category: "Social Sciences",
      description: "Government and politics.",
      related: ["Law", "International Relations"],
    },
    {
      id: "minor-spanish",
      name: "Spanish",
      category: "Humanities",
      description: "Bilingual skills for healthcare and business.",
      related: ["Linguistics", "International Relations"],
    },
    {
      id: "minor-enviro",
      name: "Environmental Studies",
      category: "Natural Sciences",
      description: "Sustainability and ecology.",
      related: ["Environmental Science", "Public Policy"],
    },
    {
      id: "minor-design",
      name: "Design",
      category: "Arts & Design",
      description: "Visual communication.",
      related: ["Graphic Design", "UX Design"],
    },
    // Majors
    {
      id: "agri",
      name: "Agriculture",
      category: "Agriculture",
      description: "Farming, food production, and sustainable agriculture.",
      related: ["Environmental Science", "Biology"],
    },
    {
      id: "hort",
      name: "Horticulture",
      category: "Agriculture",
      description: "Growing fruits, vegetables, flowers.",
      related: ["Agriculture", "Botany"],
    },
    {
      id: "foodsci",
      name: "Food Science",
      category: "Agriculture",
      description: "Food processing, safety, nutrition.",
      related: ["Chemistry", "Nutrition"],
    },
    {
      id: "animalsci",
      name: "Animal Science",
      category: "Agriculture",
      description: "Livestock, poultry, and animal biology.",
      related: ["Biology", "Pre-Veterinary"],
    },
    {
      id: "arch",
      name: "Architecture",
      category: "Architecture",
      description: "Design buildings blending creativity and engineering.",
      related: ["Civil Engineering", "Urban Planning"],
    },
    {
      id: "urban",
      name: "Urban Planning",
      category: "Architecture",
      description: "Design cities — transportation, housing, public spaces.",
      related: ["Architecture", "Public Policy"],
    },
    {
      id: "landscape",
      name: "Landscape Architecture",
      category: "Architecture",
      description: "Outdoor spaces — parks, gardens, campuses.",
      related: ["Architecture", "Horticulture"],
    },
    {
      id: "interior",
      name: "Interior Design",
      category: "Architecture",
      description: "Functional and beautiful indoor spaces.",
      related: ["Architecture", "Graphic Design"],
    },
    {
      id: "finearts",
      name: "Fine Arts",
      category: "Arts & Design",
      description: "Painting, sculpture, visual expression.",
      related: ["Graphic Design", "Art History"],
    },
    {
      id: "graphicdesign",
      name: "Graphic Design",
      category: "Arts & Design",
      description: "Visual content — branding, digital, print.",
      related: ["UX Design", "Marketing"],
    },
    {
      id: "anim",
      name: "Animation",
      category: "Arts & Design",
      description: "2D, 3D, motion graphics.",
      related: ["Film", "Game Design"],
    },
    {
      id: "film",
      name: "Film & Cinema",
      category: "Arts & Design",
      description: "Production, directing, screenwriting.",
      related: ["Animation", "Theater"],
    },
    {
      id: "music",
      name: "Music",
      category: "Arts & Design",
      description: "Performance, composition, production.",
      related: ["Audio Engineering", "Theater"],
    },
    {
      id: "theater",
      name: "Theater & Drama",
      category: "Arts & Design",
      description: "Acting, directing, stage design.",
      related: ["Film", "Music"],
    },
    {
      id: "fashion",
      name: "Fashion Design",
      category: "Arts & Design",
      description: "Clothing and accessories design.",
      related: ["Graphic Design", "Marketing"],
    },
    {
      id: "arthistory",
      name: "Art History",
      category: "Arts & Design",
      description: "Art across centuries and cultures.",
      related: ["History", "Fine Arts"],
    },
    {
      id: "uxdesign",
      name: "UX/UI Design",
      category: "Arts & Design",
      description: "Digital experiences — websites, apps.",
      related: ["Graphic Design", "CS"],
    },
    {
      id: "busadmin",
      name: "Business Administration",
      category: "Business",
      description: "Management, strategy, operations.",
      related: ["Finance", "Marketing"],
    },
    {
      id: "finance",
      name: "Finance",
      category: "Business",
      description: "Investments, banking, financial planning.",
      related: ["Accounting", "Economics"],
    },
    {
      id: "marketing",
      name: "Marketing",
      category: "Business",
      description: "Consumer behavior, branding, digital marketing.",
      related: ["Psychology", "Data Science"],
    },
    {
      id: "accounting",
      name: "Accounting",
      category: "Business",
      description: "Financial records, auditing, tax.",
      related: ["Finance", "Business Admin"],
    },
    {
      id: "entrepreneur",
      name: "Entrepreneurship",
      category: "Business",
      description: "Start and grow businesses.",
      related: ["Marketing", "Finance"],
    },
    {
      id: "supplychain",
      name: "Supply Chain Management",
      category: "Business",
      description: "Logistics, procurement, operations.",
      related: ["Business Admin", "Data Science"],
    },
    {
      id: "hr",
      name: "Human Resources",
      category: "Business",
      description: "Recruit, train, manage people.",
      related: ["Psychology", "Business Admin"],
    },
    {
      id: "hospitality",
      name: "Hospitality Management",
      category: "Business",
      description: "Hotels, restaurants, tourism.",
      related: ["Business Admin", "Marketing"],
    },
    {
      id: "realestate",
      name: "Real Estate",
      category: "Business",
      description: "Property development and investment.",
      related: ["Finance", "Architecture"],
    },
    {
      id: "comm",
      name: "Communications",
      category: "Communications",
      description: "Media, PR, advertising, messaging.",
      related: ["Journalism", "Marketing"],
    },
    {
      id: "journalism",
      name: "Journalism",
      category: "Communications",
      description: "Report, write, produce news.",
      related: ["Communications", "English"],
    },
    {
      id: "pr",
      name: "Public Relations",
      category: "Communications",
      description: "Brand reputation and media relations.",
      related: ["Communications", "Marketing"],
    },
    {
      id: "advertising",
      name: "Advertising",
      category: "Communications",
      description: "Create persuasive campaigns.",
      related: ["Marketing", "Graphic Design"],
    },
    {
      id: "cs",
      name: "Computer Science",
      category: "Computer Science",
      description: "Algorithms, AI, cybersecurity, databases.",
      related: ["Software Engineering", "Data Science"],
    },
    {
      id: "softeng",
      name: "Software Engineering",
      category: "Computer Science",
      description: "Large-scale software systems.",
      related: ["CS", "Web Development"],
    },
    {
      id: "ds",
      name: "Data Science",
      category: "Computer Science",
      description: "Insights from data — statistics, ML.",
      related: ["CS", "Statistics"],
    },
    {
      id: "cyber",
      name: "Cybersecurity",
      category: "Computer Science",
      description: "Protect digital systems.",
      related: ["CS", "IT"],
    },
    {
      id: "it",
      name: "Information Technology",
      category: "Computer Science",
      description: "Systems, networks, tech support.",
      related: ["CS", "Cybersecurity"],
    },
    {
      id: "ai",
      name: "Artificial Intelligence",
      category: "Computer Science",
      description: "ML, NLP, computer vision.",
      related: ["CS", "Data Science"],
    },
    {
      id: "gamedev",
      name: "Game Design",
      category: "Computer Science",
      description: "Video games — code, art, story.",
      related: ["CS", "Animation"],
    },
    {
      id: "webdev",
      name: "Web Development",
      category: "Computer Science",
      description: "Websites and web apps.",
      related: ["CS", "Graphic Design"],
    },
    {
      id: "edu",
      name: "Education",
      category: "Education",
      description: "Teaching, curriculum, leadership.",
      related: ["Psychology", "Social Work"],
    },
    {
      id: "earlyed",
      name: "Early Childhood Ed",
      category: "Education",
      description: "Teach children birth to elementary.",
      related: ["Education", "Psychology"],
    },
    {
      id: "specialed",
      name: "Special Education",
      category: "Education",
      description: "Support diverse learners.",
      related: ["Education", "Psychology"],
    },
    {
      id: "highered",
      name: "Higher Education Admin",
      category: "Education",
      description: "Lead colleges and universities.",
      related: ["Education", "Business"],
    },
    {
      id: "mech",
      name: "Mechanical Engineering",
      category: "Engineering",
      description: "Machines, engines, mechanical systems.",
      related: ["Aerospace", "Robotics"],
    },
    {
      id: "electrical",
      name: "Electrical Engineering",
      category: "Engineering",
      description: "Circuits, power, electronics.",
      related: ["Computer Engineering", "Robotics"],
    },
    {
      id: "civil",
      name: "Civil Engineering",
      category: "Engineering",
      description: "Bridges, roads, buildings, water.",
      related: ["Architecture", "Environmental"],
    },
    {
      id: "chemeng",
      name: "Chemical Engineering",
      category: "Engineering",
      description: "Materials into products.",
      related: ["Chemistry", "Bioengineering"],
    },
    {
      id: "biomed",
      name: "Biomedical Engineering",
      category: "Engineering",
      description: "Engineering meets medicine.",
      related: ["Biology", "Mechanical"],
    },
    {
      id: "compeng",
      name: "Computer Engineering",
      category: "Engineering",
      description: "Hardware + software.",
      related: ["CS", "Electrical"],
    },
    {
      id: "aero",
      name: "Aerospace Engineering",
      category: "Engineering",
      description: "Aircraft, spacecraft, satellites.",
      related: ["Mechanical", "Physics"],
    },
    {
      id: "environeng",
      name: "Environmental Engineering",
      category: "Engineering",
      description: "Water, pollution, sustainability.",
      related: ["Civil", "Chemistry"],
    },
    {
      id: "industrial",
      name: "Industrial Engineering",
      category: "Engineering",
      description: "Optimize systems and processes.",
      related: ["Mechanical", "Business"],
    },
    {
      id: "materials",
      name: "Materials Science",
      category: "Engineering",
      description: "New materials — metals, polymers.",
      related: ["Chemistry", "Physics"],
    },
    {
      id: "robotics",
      name: "Robotics Engineering",
      category: "Engineering",
      description: "Autonomous machines.",
      related: ["Mechanical", "Electrical", "CS"],
    },
    {
      id: "premed",
      name: "Pre-Medicine",
      category: "Health & Medicine",
      description: "Prepare for medical school.",
      related: ["Biology", "Neuroscience"],
    },
    {
      id: "nursing",
      name: "Nursing",
      category: "Health & Medicine",
      description: "Direct patient care.",
      related: ["Public Health", "Biology"],
    },
    {
      id: "pharmacy",
      name: "Pharmacy",
      category: "Health & Medicine",
      description: "Study drugs and medications.",
      related: ["Chemistry", "Biology"],
    },
    {
      id: "dental",
      name: "Pre-Dentistry",
      category: "Health & Medicine",
      description: "Prepare for dental school.",
      related: ["Biology", "Pre-Med"],
    },
    {
      id: "vet",
      name: "Pre-Veterinary",
      category: "Health & Medicine",
      description: "Animal medicine.",
      related: ["Biology", "Animal Science"],
    },
    {
      id: "pubhealth",
      name: "Public Health",
      category: "Health & Medicine",
      description: "Community health and prevention.",
      related: ["Biology", "Statistics"],
    },
    {
      id: "sportsmed",
      name: "Sports Medicine",
      category: "Health & Medicine",
      description: "Athletic training and rehab.",
      related: ["Kinesiology", "Pre-Med"],
    },
    {
      id: "nutrit",
      name: "Nutrition & Dietetics",
      category: "Health & Medicine",
      description: "Food as medicine.",
      related: ["Biology", "Public Health"],
    },
    {
      id: "healthadmin",
      name: "Healthcare Admin",
      category: "Health & Medicine",
      description: "Manage hospitals and clinics.",
      related: ["Business", "Public Health"],
    },
    {
      id: "physicaltherapy",
      name: "Physical Therapy",
      category: "Health & Medicine",
      description: "Recovery and pain management.",
      related: ["Kinesiology", "Sports Medicine"],
    },
    {
      id: "english",
      name: "English",
      category: "Humanities",
      description: "Literature, writing, critical thinking.",
      related: ["Journalism", "Law"],
    },
    {
      id: "history",
      name: "History",
      category: "Humanities",
      description: "Understand the past.",
      related: ["Political Science", "English"],
    },
    {
      id: "philosophy",
      name: "Philosophy",
      category: "Humanities",
      description: "Ethics, logic, existence.",
      related: ["Law", "Political Science"],
    },
    {
      id: "linguistics",
      name: "Linguistics",
      category: "Humanities",
      description: "Language — structure, meaning.",
      related: ["CS (NLP)", "Anthropology"],
    },
    {
      id: "classics",
      name: "Classics",
      category: "Humanities",
      description: "Ancient Greece and Rome.",
      related: ["History", "Philosophy"],
    },
    {
      id: "religion",
      name: "Religious Studies",
      category: "Humanities",
      description: "World religions.",
      related: ["Philosophy", "History"],
    },
    {
      id: "foreignlang",
      name: "Foreign Languages",
      category: "Humanities",
      description: "Spanish, French, Mandarin, etc.",
      related: ["Linguistics", "International Relations"],
    },
    {
      id: "prelaw",
      name: "Pre-Law",
      category: "Law & Policy",
      description: "Prepare for law school.",
      related: ["Political Science", "Criminal Justice"],
    },
    {
      id: "crimjust",
      name: "Criminal Justice",
      category: "Law & Policy",
      description: "Crime, law enforcement, courts.",
      related: ["Pre-Law", "Psychology"],
    },
    {
      id: "intrel",
      name: "International Relations",
      category: "Law & Policy",
      description: "Global politics and diplomacy.",
      related: ["Political Science", "Economics"],
    },
    {
      id: "pubpol",
      name: "Public Policy",
      category: "Law & Policy",
      description: "Government policies analysis.",
      related: ["Political Science", "Economics"],
    },
    {
      id: "math",
      name: "Mathematics",
      category: "Mathematics",
      description: "Abstract reasoning and proofs.",
      related: ["Physics", "CS"],
    },
    {
      id: "stats",
      name: "Statistics",
      category: "Mathematics",
      description: "Data analysis and probability.",
      related: ["Data Science", "Economics"],
    },
    {
      id: "actuarial",
      name: "Actuarial Science",
      category: "Mathematics",
      description: "Financial risk assessment.",
      related: ["Statistics", "Finance"],
    },
    {
      id: "bio",
      name: "Biology",
      category: "Natural Sciences",
      description: "Life sciences.",
      related: ["Pre-Med", "Environmental Science"],
    },
    {
      id: "chem",
      name: "Chemistry",
      category: "Natural Sciences",
      description: "Matter and reactions.",
      related: ["Biochemistry", "Chemical Engineering"],
    },
    {
      id: "physics",
      name: "Physics",
      category: "Natural Sciences",
      description: "Fundamental laws of the universe.",
      related: ["Engineering", "Math"],
    },
    {
      id: "biochem",
      name: "Biochemistry",
      category: "Natural Sciences",
      description: "Chemistry of life.",
      related: ["Biology", "Chemistry"],
    },
    {
      id: "neuro",
      name: "Neuroscience",
      category: "Natural Sciences",
      description: "Brain and nervous system.",
      related: ["Psychology", "Biology"],
    },
    {
      id: "enviro",
      name: "Environmental Science",
      category: "Natural Sciences",
      description: "Earth, climate, sustainability.",
      related: ["Biology", "Geology"],
    },
    {
      id: "astronomy",
      name: "Astronomy",
      category: "Natural Sciences",
      description: "Stars, planets, galaxies.",
      related: ["Physics", "Math"],
    },
    {
      id: "geology",
      name: "Geology",
      category: "Natural Sciences",
      description: "Earth's structure and resources.",
      related: ["Environmental Science", "Civil Engineering"],
    },
    {
      id: "marinebio",
      name: "Marine Biology",
      category: "Natural Sciences",
      description: "Ocean life.",
      related: ["Biology", "Environmental Science"],
    },
    {
      id: "psych",
      name: "Psychology",
      category: "Social Sciences",
      description: "Human mind and behavior.",
      related: ["Neuroscience", "Sociology"],
    },
    {
      id: "sociology",
      name: "Sociology",
      category: "Social Sciences",
      description: "Society, inequality, change.",
      related: ["Psychology", "Criminal Justice"],
    },
    {
      id: "economics",
      name: "Economics",
      category: "Social Sciences",
      description: "Resources and decision-making.",
      related: ["Finance", "Data Science"],
    },
    {
      id: "polisci",
      name: "Political Science",
      category: "Social Sciences",
      description: "Government, politics, power.",
      related: ["Law", "International Relations"],
    },
    {
      id: "anthropology",
      name: "Anthropology",
      category: "Social Sciences",
      description: "Human cultures worldwide.",
      related: ["Sociology", "Archaeology"],
    },
    {
      id: "archaeology",
      name: "Archaeology",
      category: "Social Sciences",
      description: "Uncover the past.",
      related: ["Anthropology", "History"],
    },
    {
      id: "geography",
      name: "Geography",
      category: "Social Sciences",
      description: "Places, landscapes, GIS.",
      related: ["Environmental Science", "Urban Planning"],
    },
    {
      id: "socialwork",
      name: "Social Work",
      category: "Social Sciences",
      description: "Help individuals and communities.",
      related: ["Psychology", "Sociology"],
    },
  ];
}

export const useMajorStore = defineStore("majors", () => {
  const topPicks = ref<TopPick[]>([]);
  const customMajors = ref<Major[]>([]);
  (function load() {
    const sp = localStorage.getItem(getUserKey("top-picks"));
    if (sp) topPicks.value = JSON.parse(sp);
    const sc = localStorage.getItem(getUserKey("custom-majors"));
    if (sc) customMajors.value = JSON.parse(sc);
  })();
  function savePicks() {
    localStorage.setItem(
      getUserKey("top-picks"),
      JSON.stringify(topPicks.value),
    );
  }
  function saveCustom() {
    localStorage.setItem(
      getUserKey("custom-majors"),
      JSON.stringify(customMajors.value),
    );
  }
  function addTopPick(pick: TopPick) {
    topPicks.value.push(pick);
    savePicks();
  }
  function updateTopPick(id: string, u: TopPick) {
    const i = topPicks.value.findIndex((p) => p.id === id);
    if (i !== -1) {
      topPicks.value[i] = u;
      savePicks();
    }
  }
  function removeTopPick(id: string) {
    topPicks.value = topPicks.value.filter((p) => p.id !== id);
    savePicks();
  }
  function addCustomMajor(m: Major) {
    customMajors.value.push(m);
    saveCustom();
  }
  function removeCustomMajor(id: string) {
    customMajors.value = customMajors.value.filter((m) => m.id !== id);
    saveCustom();
  }
  return {
    topPicks,
    customMajors,
    addTopPick,
    updateTopPick,
    removeTopPick,
    addCustomMajor,
    removeCustomMajor,
  };
});
