import { Button } from "@/components/ui/button";
import { signOutAndCleanupAction } from "@/app/actions/authActions";

export function SignOut() {
  return (
    <div>
      <form action={signOutAndCleanupAction}>
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
}
