import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeLoader } from "@/components/ui/FontAwesomeLoader";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";


export default function CreditsPage() {
  return (
    <PageContainer maxWidth="lg">
          <div className="space-y-6 py-10">

    <Card className="border shadow-sm max-w-max py-5 my-5">
      <CardContent className="pt-6">
        <div className=" py-12 text-2xl font-semibold prose prose-slate">
          <FontAwesomeLoader /> 
          <div className="max-w-max mx-auto px-4">
            <div className="text-center mb-12 dark:prose-invert max-w-none">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              <a href="https://ko-fi.com/eribyte">
                <p><i className="fa-solid fa-mug-hot"></i>  Donate!  </p>
              
              </a>
              </h1>
              {/* <h6>please 🥺</h6> */}
              <Separator className="my-6" />
              <p className="text-slate-600 dark:text-slate-300 text-lg py-3">
                Your donation helps to fund the development of Eribot, server costs, as well as buy me monsters. Delicious Delicious Monsters.
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-lg py-3">
                Currently there is no Inscentive to donate, other than my gratitude and the fact I would like you more :3
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-lg py-3">
                All donation are non refundable.
              </p>
              <Image className="mx-auto"
              src="/Eribyte.png"
              alt={`Photo of Eribyte`}
              height={512}
              width={512} />
              <Separator className="my-6" />
              <div className=" text-6xl">
                <a href="https://ko-fi.com/eribyte"><i className="fa-solid fa-mug-hot"></i></a>
                <a href="https://streamlabs.com/eribytevt/tip"><i className="fab fa-brands fa-paypal px-6"></i></a>
                <a href="https://throne.com/eribyte"><i className="fa-solid fa-crown"></i></a>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                
              </p>
            
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
    </PageContainer>
  );
}
