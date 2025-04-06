import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Info, FileQuestion } from "lucide-react";
import { DiscordLogoIcon } from "@radix-ui/react-icons";

export default async function HowToPage() {
  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-8 py-8">
        <SectionHeader
          title="How to Use Eribot"
          description="A comprehensive guide to help you get started"
        />

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="managing-streams">Managing Streams</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* GETTING STARTED TAB */}
          <TabsContent value="getting-started" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Getting Started with Eribot
                </CardTitle>
                <CardDescription>
                  Follow these steps to set up Eribot for your Discord server.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Step 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold">
                      Log in with Discord
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-muted-foreground mb-4">
                        Click the &quot;Login with Discord&quot; button in the
                        top-right corner of the page. You&apos;ll need to
                        authorize Eribot to access your Discord account.
                      </p>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex gap-2">
                          <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Eribot only requests the permissions it needs to
                            function, such knowledge of servers you&apos;re in.
                            Eribot uses Encrypted JWT tokens to store Discord
                            Information.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Image
                      src="/Login_Discord.png"
                      alt={`Login with discord`}
                      width={800}
                      height={450}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Step 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold">
                      Navigate to Your Servers
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-muted-foreground mb-4">
                        Once logged in, click on &quot;Manage&quot; in the
                        navigation bar. This will show you all the Discord
                        servers where you have admin permissions.
                      </p>
                      <p className="text-muted-foreground">
                        Only servers where users have admin permissions will be
                        displayed, as a way to make sure only people you trust
                        can alter your schedule
                      </p>
                    </div>
                    <Image
                      src="/Manage.png"
                      alt={`Login with discord`}
                      width={800}
                      height={450}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Step 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </div>
                    <h3 className="text-xl font-semibold">
                      Select Your Discord Server
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-muted-foreground mb-4">
                        Click on the Discord server you want to manage with
                        Eribot. If this is your first time using Eribot with
                        this server, you&apos;ll be taken to the onboarding
                        process.
                      </p>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <div className="flex gap-2">
                          <Info className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Servers with a &quot;Setup Needed&quot; badge
                            require you to complete the onboarding process
                            before you can manage streams.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Image
                      src="/Guilds.png"
                      alt={`Login with discord`}
                      width={800}
                      height={450}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Step 4 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </div>
                    <h3 className="text-xl font-semibold">
                      Complete the Onboarding Process
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        For new servers, you&apos;ll need to complete a two-step
                        onboarding process:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Invite the Eribot:
                          </span>{" "}
                          Click the &quot;Invite Bot to Server&quot; button to
                          add Eribot to your Discord server.
                        </li>
                        <li className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Set up streamer information:
                          </span>{" "}
                          Enter your streamer name and configure basic settings.
                        </li>
                      </ol>
                      <p className="text-muted-foreground">
                        After completing these steps, you&apos;ll be redirected
                        to your server&apos;s management page.
                      </p>
                    </div>
                    <Image
                      src="/Onboard.png"
                      alt={`Login with discord`}
                      width={800}
                      height={450}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MANAGING STREAMS TAB */}
          <TabsContent value="managing-streams" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Managing Your Stream Schedule
                </CardTitle>
                <CardDescription>
                  Learn how to create, edit, and organize your streaming
                  schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Adding a Stream */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Adding a New Stream</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        To add a new stream to your schedule:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li className="text-muted-foreground">
                          Enter your stream name in the &quot;Stream Name&quot;
                          field
                        </li>
                        <li className="text-muted-foreground">
                          Set the date and time using the date picker
                        </li>
                        <li className="text-muted-foreground">
                          Enter the duration in minutes
                        </li>
                        <li className="text-muted-foreground">
                          Click the green &quot;+&quot; button to add the stream
                        </li>
                      </ol>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <div className="flex gap-2">
                          <Info className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <p className="text-sm text-green-700 dark:text-green-300">
                            If you&apos;ve enabled auto-publish to Discord or
                            Twitch, the stream will automatically be added to
                            those platforms when you create it.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Image
                      src="/AddStream.png"
                      alt={`Login with discord`}
                      width={1000}
                      height={600}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Editing a Stream */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Editing an Existing Stream
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        To edit a stream in your schedule:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li className="text-muted-foreground">
                          Click the three dots menu at the end of the stream row
                        </li>
                        <li className="text-muted-foreground">
                          Select &quot;Edit&quot; from the dropdown menu
                        </li>
                        <li className="text-muted-foreground">
                          Update the stream details in the edit modal
                        </li>
                        <li className="text-muted-foreground">
                          Click &quot;Save Changes&quot; to update the stream
                        </li>
                      </ol>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex gap-2">
                          <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            When you edit a stream, any associated Discord
                            events and Twitch schedule segments will be
                            automatically updated.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Image
                        src="/Edit.png"
                        alt={`Login with discord`}
                        width={1000}
                        height={600}
                        className="rounded-lg border shadow-sm"
                      />
                      <Image
                        src="/EditModal.png"
                        alt={`Login with discord`}
                        width={1000}
                        height={600}
                        className="rounded-lg border shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Deleting a Stream */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Deleting a Stream</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        To delete a stream from your schedule:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li className="text-muted-foreground">
                          Click the three dots menu at the end of the stream row
                        </li>
                        <li className="text-muted-foreground">
                          Select &quot;Delete&quot; from the dropdown menu
                        </li>
                        <li className="text-muted-foreground">
                          Confirm deletion in the confirmation dialog
                        </li>
                      </ol>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <div className="flex gap-2">
                          <Info className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            When you delete a stream, any associated Discord
                            events and Twitch schedule segments will also be
                            deleted. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Image
                      src="/Delete.png"
                      alt={`Login with discord`}
                      width={1000}
                      height={600}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Filtering Streams */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Filtering and Date Ranges
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        You can view streams for specific date ranges:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li className="text-muted-foreground">
                          Click the date range button at the top of the stream
                          table
                        </li>
                        <li className="text-muted-foreground">
                          Select your desired start and end dates in the
                          calendar
                        </li>
                        <li className="text-muted-foreground">
                          The table will update to show only streams within the
                          selected date range
                        </li>
                      </ol>
                      <p className="text-muted-foreground">
                        You can also sort streams by clicking on the column
                        headers.
                      </p>
                    </div>
                    <Image
                      src="/DateSelector.png"
                      alt={`Login with discord`}
                      width={1000}
                      height={600}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Setting Up Integrations
                </CardTitle>
                <CardDescription>
                  Connect your Twitch account and configure auto-publishing
                  options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Twitch Integration */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Connecting Your Twitch Account
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        To connect your Twitch account:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li className="text-muted-foreground">
                          Go to the &quot;Twitch Connection&quot; section on
                          your server&apos;s management page
                        </li>
                        <li className="text-muted-foreground">
                          Enter your Twitch username in the search box and click
                          &quot;Search&quot;
                        </li>
                        <li className="text-muted-foreground">
                          Select your Twitch account from the results
                        </li>
                        <li className="text-muted-foreground">
                          Click &quot;Authenticate as this User&quot; and follow
                          the Twitch authentication process
                        </li>
                      </ol>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                        <div className="flex gap-2">
                          <Info className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            You must be the owner of the Twitch account or have
                            permission to manage its schedule to complete this
                            connection.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Image
                      src="/TwitchConnect.png"
                      alt={`Login with discord`}
                      width={800}
                      height={450}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Auto-Publish Settings */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Configuring Auto-Publish Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        In the &quot;Guild Options&quot; section, you can
                        configure auto-publishing:
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 mt-0.5 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium">
                              Auto Publish Discord Event
                            </p>
                            <p className="text-sm text-muted-foreground">
                              When enabled, creating a stream will automatically
                              create a Discord event in your server.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 mt-0.5 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium">
                              Auto Publish Twitch Event
                            </p>
                            <p className="text-sm text-muted-foreground">
                              When enabled, creating a stream will automatically
                              add it to your Twitch schedule. Requires a
                              connected Twitch account.
                            </p>
                          </div>
                        </li>
                      </ul>
                      <p className="text-muted-foreground">
                        Click &quot;Save Settings&quot; after making changes.
                      </p>
                    </div>
                    <Image
                      src="/GuildOptions.png"
                      alt={`Login with discord`}
                      width={800}
                      height={450}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Manual Publishing */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Manual Publishing to Platforms
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        If you haven&apos;t enabled auto-publishing, you can
                        manually publish streams:
                      </p>
                      <ul className="space-y-2">
                        <li className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Discord:
                          </span>{" "}
                          Click the &quot;Send to Discord&quot; button in the
                          stream row
                        </li>
                        <li className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Twitch:
                          </span>{" "}
                          Click the &quot;Send to Twitch&quot; button in the
                          stream row
                        </li>
                      </ul>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex gap-2">
                          <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Once a stream has been published to a platform, the
                            button will change to a checkmark to indicate
                            it&apos;s already been published.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Image
                      src="/Buttons.png"
                      alt={`Login with discord`}
                      width={800}
                      height={450}
                      className="rounded-lg border shadow-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FAQs and Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">
                      Why can&apos;t I see my Discord server?
                    </h4>
                  </div>
                  <p className="text-muted-foreground text-sm pl-7">
                    You need administrator permissions in a Discord server to
                    use Eribot with it. If you don&apos;t see your server, make
                    sure you have the administrator permission.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">
                      Can I connect multiple Twitch accounts?
                    </h4>
                  </div>
                  <p className="text-muted-foreground text-sm pl-7">
                    Not currently, Eribot supports connecting one Twitch account
                    per Discord server. Each server can have its own unique
                    Twitch connection.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">
                      Will there be youtube support soon?
                    </h4>
                  </div>
                  <p className="text-muted-foreground text-sm pl-7">
                    not for a long while, I&apos;ve looked into it and with the
                    free api from youtube I could make 3 live streams per day,
                    which isn&apos;t enough to support more than 0.75 users.
                    Maybe in the future or if the youtube api changes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">
                      Does the website update automatically?
                    </h4>
                  </div>
                  <p className="text-muted-foreground text-sm pl-7">
                    Yes! The generated website automatically fetches the latest
                    schedule data from Eribot, if you don&apos;t want this to
                    happen, don&apos;t add a stream to Eribot until you&apos;re
                    ready (subject to change in the future)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Is there a mobile app?</h4>
                  </div>
                  <p className="text-muted-foreground text-sm pl-7">
                    No, Eribot is a web-based application with one very tired
                    (back end) dev. Eventually I&apos;ll try and make it look
                    okay on mobile.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">
                      How do I get help with Eribot?
                    </h4>
                  </div>
                  <p className="text-muted-foreground text-sm pl-7">
                    For additional support, you can join our Discord server or
                    contact us via email. See the support section below.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Need Additional Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-4">
                <div className="rounded-full bg-primary/10 p-3 flex-shrink-0">
                  <DiscordLogoIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">
                    Join Our Discord Community
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get help from our community and team members, share feature
                    requests, and stay updated.
                  </p>
                  <Button variant="outline" size="sm" >
                    <Link href="https://discord.gg/CmWhF5Jyqf" target="_blank" rel="noopener noreferrer" >
                    Join Server!
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
