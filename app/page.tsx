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
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default async function DashboardPage() {
  const session = await auth();

  console.log("ASSET PATH RIGHT HERE");
  console.log(process.env.ASSET_PREFIX);
  console.log("LOOK ABOVE HERE");
  if (!session || !session.user.discordAccount)
    return (
      <>
        <AssetPrefixDisplay />
        <div
          className="hidden md:grid place-items-center overflow-hidden"
          style={{ height: "calc(100vh - 66px)" }}
        >
          <div className="space-y-4 ">
            <div className="flex items-center justify-center">
              <h2 className="text-3xl font-bold tracking-tight text-center">
                Dashboard
              </h2>
            </div>
            <div className="flex items-center justify-center">
              <Card>
                <CardHeader className="flex items-center justify-center">
                  <CardTitle>⚠️ Protected Content</CardTitle>
                  <CardDescription>
                    To view your dashboard, please sign in using discord.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
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
