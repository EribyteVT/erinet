import { Metadata } from "next";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { auth } from "@/auth";
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
        <h1 className=" text-6xl text-center py-7">Welcome to Eribot!</h1>
        <Image
          className="rounded-full mx-auto"
          src="/eri-face.png"
          alt=" a photo of eribyte"
          height={600}
          width={600}
        />
        <div className="text-center py-4">
          art by:{" "}
          <a
            className=" border-b-2 border-white"
            href="https://twitch.tv/eribytevt"
          >
            no one
          </a>
        </div>

        <div className="max-w-7xl mx-auto mb-12 px-4">
          <Card className="mb-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-200 dark:border-purple-800">
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
        <div className=" px-3">
          <ChangeLog
            content={await myReadFile("/public/changelog.json")}
          ></ChangeLog>
        </div>
      </Card>
    </>
  );
}
