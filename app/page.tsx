import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import ChangeLog from "@/components/home-screen/ChangeLog";

import { promises as fs } from "fs";
import AssetPrefixDisplay from "@/components/debug/AssetPrefixDisplay";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import { Calendar, Globe, TwitchIcon } from "lucide-react";

const myReadFile = async (path: string) => {
  const file = await fs.readFile(process.cwd() + path, "utf8");
  const data = JSON.parse(file);
  return data;
};

export default async function DashboardPage() {
  return (
    <>
      {/* debug info */}
      <AssetPrefixDisplay />
      <div className=" relative">
        {/* Image and Title Side by Side */}
        <div className="flex items-center justify-center gap-6 py-7">
          <div>
            <Image
              className="rounded-3xl"
              src="/Eribot_face.png"
              alt=" a photo of eribyte"
              height={250}
              width={250}
            />
            <div className="text-center">
              art by:{" "}
              <a
                className=" border-b-2 border-white"
                href="https://sleepycrea.carrd.co/"
              >
                @sleepycrea
              </a>
            </div>
          </div>
          <h1 className="text-6xl">Welcome to Eribot!</h1>
        </div>

        {/* Large Centered Button with Circuit Board Background */}
        <div className="flex justify-center relative">
          <div className="relative w-full">
            {/* Circuit Board Image Background */}
            <div
              className="absolute inset-0 flex justify-center items-center"
              style={{ height: "400px" }}
            >
              <Image
                src="/circuit_board.png"
                alt="Circuit board pattern"
                width={1600}
                height={400}
                className="object-cover w-full h-full opacity-80"
                priority
              />
            </div>

            {/* Button on top of pattern */}
            <div
              className="relative z-10 flex justify-center"
              style={{ paddingTop: "150px" }}
            >
              <Link href="/guilds">
                <Button
                  size="lg"
                  className="text-2xl px-12 py-10 shadow-2xl bg-purple-600 hover:bg-purple-700 border-2 border-purple-400"
                >
                  Manage Your Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-12 px-4  py-50">
          <Card className="mb-8 bg-linear-to-r from-purple-500/20 to-blue-500/20 border border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                What is Eribot?
              </CardTitle>
              <CardDescription className="text-center text-lg">
                A Website/Discord Bot for streamers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg mb-4">
                Eribot is a website designed for streamers to manage their
                schedule, having a single source to change instead of having to
                change it on several platforms
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                </div>
                <CardTitle>Schedule Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Create and manage your stream schedule. Plan your content in
                  advance and keep your audience informed.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <DiscordLogoIcon className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
                  <TwitchIcon className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
                </div>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Automatically publish events to your Discord server and Twitch
                  channel. Keep your community updated without any extra effort.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="bg-pink-100 dark:bg-pink-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Globe className="h-6 w-6 text-pink-700 dark:text-pink-300" />
                </div>
                <CardTitle>Website Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Create a custom website to showcase your schedule and social
                  media links.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Card className=" dark:black shadow-xl  mx-8">
        <div className=" px-3 my-4">
          <ChangeLog
            content={await myReadFile("/public/changelog.json")}
          ></ChangeLog>
        </div>
      </Card>
    </>
  );
}
