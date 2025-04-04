import { Metadata } from "next";
import Image from "next/image";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { auth } from "@/auth";
import ChangeLog from "@/components/home-screen/ChangeLog";

import { promises as fs } from "fs";
import AssetPrefixDisplay from "@/components/debug/AssetPrefixDisplay";

const myReadFile = async (path: string) => {
  const file = await fs.readFile(process.cwd() + path, "utf8");
  const data = JSON.parse(file);
  return data;
};

export const metadata: Metadata = {
  title: "Eribot!",
  description: "A website for managing a streamer's schedule",
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
