import ScheduleImageGenerator from "@/components/image/ScheduleImageGenerator";
import { AppMode } from "@/components/image/ScheduleImageGenerator";

interface SearchParams {
  guildId?: string;
  mode?: AppMode;
}

export default async function ImagePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const guildId = params.guildId;
  const mode = params.mode || "design";

  return (
    <>
      <ScheduleImageGenerator
        guildId={guildId!}
        defaultMode={mode}
        streamerId={3}
      />
    </>
  );
}
