import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeLoader } from "@/components/ui/FontAwesomeLoader";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

export default function CreditsPage() {
  return (
    <PageContainer maxWidth="lg">
      <div className="py-12 md:py-16">
        <Card className="border shadow-md rounded-xl overflow-hidden max-w-3xl mx-auto">
          <CardContent className="p-0">
            <div className="bg-gradient-to-b from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 p-8 md:p-10">
              <FontAwesomeLoader />

              <div className="text-center space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  <span className="inline-flex items-center gap-2">
                    <i className="fa-solid fa-mug-hot text-amber-500"></i>
                    Support Eribot
                  </span>
                </h1>

                <Separator className="max-w-xs mx-auto" />

                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300">
                    Your donation helps fund the development of Eribot,
                    server/domain costs, and keeps me supplied with delicious
                    energy drinks!
                  </p>

                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Currently there's no incentive to donate other than my
                    gratitude and the fact I would like you more :3
                  </p>

                  <p className="text-slate-500 dark:text-slate-500 text-xs">
                    All donations are non-refundable.
                  </p>
                </div>

                <div className="relative w-48 h-48 mx-auto my-6">
                  <Image
                    className="rounded-full border-4 border-white dark:border-slate-800 shadow-lg"
                    src="/Eribyte.png"
                    alt="Photo of Eribyte"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <Separator className="max-w-xs mx-auto" />
                <div className="pt-4">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Donate at:
                  </h2>
                </div>

                <div className="flex justify-center gap-8 text-4xl">
                  <a
                    href="https://ko-fi.com/eribyte"
                    className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    aria-label="Support on Ko-fi"
                  >
                    <i className="fa-solid fa-mug-hot"></i>
                  </a>
                  <a
                    href="https://streamlabs.com/eribytevt/tip"
                    className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Tip via PayPal"
                  >
                    <i className="fab fa-brands fa-paypal"></i>
                  </a>
                  <a
                    href="https://throne.com/eribyte"
                    className="text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                    aria-label="Visit Throne wishlist"
                  >
                    <i className="fa-solid fa-crown"></i>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
