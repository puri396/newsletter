import { prisma } from "@/lib/db";
import { ContentLibraryTabs } from "./ContentLibraryTabs";

export const revalidate = 60;

export default async function ContentLibraryPage() {
  const newsletters = await prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Content Library</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Manage all your newsletters, images, and videos.
        </p>
      </div>

      <ContentLibraryTabs
        newsletters={newsletters.map((n) => ({
          id: n.id,
          title: n.subject,
          status: n.status,
          createdAt: n.createdAt.toISOString(),
          bannerImageUrl: n.bannerImageUrl,
        }))}
      />
    </div>
  );
}
