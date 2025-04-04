import Image from "next/image";
import React from "react";

// Define types for the credits data structure
type Person = {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  websiteUrl?: string;
  websiteLabel?: string;
};

type CreditCategory = {
  title: string;
  description: string;
  colorScheme: {
    bg: string;
    darkBg: string;
    border: string;
    darkBorder: string;
    text: string;
    darkText: string;
    imageBorder: string;
    darkImageBorder: string;
  };
  people: Person[];
  footerText?: string | undefined;
};

const creditData: CreditCategory[] = [
  {
    title: "Developers",
    description: "The people who made this project possible",
    colorScheme: {
      bg: "bg-purple-50",
      darkBg: "dark:bg-purple-900/20",
      border: "border-purple-100",
      darkBorder: "dark:border-purple-800",
      text: "text-purple-800",
      darkText: "dark:text-purple-300",
      imageBorder: "border-purple-200",
      darkImageBorder: "dark:border-purple-700",
    },
    people: [
      {
        name: "Eribyte",
        role: "Lead Developer",
        description:
          "Lead developer and creator. Designed and built the core functionality, backend systems, and frontend interface.",
        imageUrl: "/Eribyte.png",
        websiteUrl: "https://eribyte.net",
        websiteLabel: "Visit Website",
      },
    ],
  },
  {
    title: "Artists",
    description: "The talented artists who contributed",
    colorScheme: {
      bg: "bg-green-50",
      darkBg: "dark:bg-green-900/20",
      border: "border-green-100",
      darkBorder: "dark:border-green-800",
      text: "text-green-800",
      darkText: "dark:text-green-300",
      imageBorder: "border-green-200",
      darkImageBorder: "dark:border-green-800",
    },
    people: [
      {
        name: "Eribyte",
        role: "Artist",
        description:
          "Im getting a new one soon, my ms paint doodles don't cut it",
        imageUrl: "/Eribyte.png",
        websiteUrl: "https://example.com",
        websiteLabel: "Visit Portfolio",
      },
    ],
  },
  {
    title: "Beta Testers",
    description: "The testers who helped improve the project",
    colorScheme: {
      bg: "bg-blue-50",
      darkBg: "dark:bg-blue-900/20",
      border: "border-blue-100",
      darkBorder: "dark:border-blue-800",
      text: "text-blue-800",
      darkText: "dark:text-blue-300",
      imageBorder: "border-blue-200",
      darkImageBorder: "dark:border-blue-800",
    },
    people: [
      {
        name: "Akafox",
        role: "Beta Tester",
        description:
          "Provided valuable feedback and helped identify bugs during development. Has been using Eribot since it was just a discord bot",
        imageUrl: "/Aka.png",
        websiteUrl: "https://example.com",
        websiteLabel: "Visit Website",
      },
    ],
    footerText:
      "And many more amazing testers who helped make this project better!",
  },
  {
    title: "Misc Credits I want to give, It's my site I do what I want",
    description: "The testers who helped improve the project",
    colorScheme: {
      bg: "bg-red-50",
      darkBg: "dark:bg-red-900/20",
      border: "border-red-100",
      darkBorder: "dark:border-red-800",
      text: "text-red-800",
      darkText: "dark:text-red-300",
      imageBorder: "border-red-200",
      darkImageBorder: "dark:border-red-800",
    },
    people: [
      {
        name: "Synth Samurii",
        role: "Beta Tester",
        description:
          "The man that got me into vtubing, as well as a good friend that always has my back",
        imageUrl: "/Synth.png",
        websiteUrl: "https://example.com",
        websiteLabel: "Visit Website",
      },
      {
        name: "Eris Aconitum",
        role: "Beta Tester",
        description: "My vtuber mom that rigged my model",
        imageUrl: "/Eris.png",
        websiteUrl: "https://erisaconitum.wordpress.com/",
        websiteLabel: "Visit Website",
      },
    ],
  },
];

const PersonCard = ({
  person,
  colorScheme,
}: {
  person: Person;
  colorScheme: CreditCategory["colorScheme"];
}) => (
  <div
    className={`flex flex-col md:flex-row items-center gap-6 p-4 ${colorScheme.bg} ${colorScheme.darkBg} rounded-lg border ${colorScheme.border} ${colorScheme.darkBorder}`}
  >
    <div className="flex-shrink-0">
      <div
        className={`w-32 h-32 rounded-full overflow-hidden border-4 ${colorScheme.imageBorder} ${colorScheme.darkImageBorder}`}
      >
        <Image
          className="rounded-full mx-auto"
          src={person.imageUrl}
          alt={`Photo of ${person.name}`}
          height={128}
          width={128}
        />
      </div>
    </div>
    <div className="flex-1 text-center md:text-left">
      <h3
        className={`text-xl font-bold ${colorScheme.text} ${colorScheme.darkText}`}
      >
        {person.name}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 mt-2">
        {person.description}
      </p>
      <a
        href={person.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        <span>{person.websiteLabel || "Visit Website"}</span>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          ></path>
        </svg>
      </a>
    </div>
  </div>
);

// Component to render a category of credits
const CreditCategorySection = ({ category }: { category: CreditCategory }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden mb-8">
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {category.title}
      </h2>

      <div className="space-y-6">
        {category.people.map((person, index) => (
          <PersonCard
            key={`${category.title}-${person.name}-${index}`}
            person={person}
            colorScheme={category.colorScheme}
          />
        ))}

        {category.footerText && (
          <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <p className="text-center text-slate-500 dark:text-slate-400">
              {category.footerText}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function CreditsPage() {
  let pageTitle = "Credits";
  let pageDescription = "The people who made this project possible";
  let footerText = "Shoutout to my mom, I love my mom";
  let copyrightName = "Eribot";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-max mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {pageTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {pageDescription}
          </p>
        </div>

        {/* Grid layout for categories - 2 per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Map through all categories and render them */}
          {creditData.map((category, index) => (
            <CreditCategorySection
              key={`category-${index}`}
              category={category}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-500 dark:text-slate-400 mb-3">
            {footerText}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} {copyrightName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
