import { auth } from "@/auth";

export default async function Page() {
  return (
    <>
      <ol className="list-decimal mx-14">
        <li>log in with discord</li>
        <li>go to streams in the top bar</li>
        <span className="mx-4">
          this will show you every discord server you are an admin in
        </span>
        <li>click on your discord server</li>
        <li>add in data about your stream</li>
        <li>hit the green + button</li>
      </ol>
    </>
  );
}
