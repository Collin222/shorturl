import { useRouter } from "next/router";
import { api } from "../utils/api";

export default function Link() {
  const router = useRouter();

  const { id } = router.query;

  if (!id || (typeof id !== "string" && typeof id[0] !== "string"))
    return <p>Invalid Link</p>;

  const link = api.links.getLink.useQuery(
    { id: typeof id === "string" ? id : (id[0] as string) },
    {
      onSuccess: async (data) => {
        if (!data) return;
        let url = data.url;
        if (!url.startsWith("https://") && !url.startsWith("http://"))
          url = `https://${url}`;
        await router.replace(url);
      },
    }
  );

  if (link.isLoading) return <p>Redirecting...</p>;

  if (link.isError) return <p>Failed to redirect</p>;

  if (link.data == null) return <p>Invalid Link</p>;
}
