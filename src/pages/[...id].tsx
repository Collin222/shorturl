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
      onSuccess: (data) => {
        console.log(typeof id === "string" ? id : (id[0] as string));
        console.log(data);
        if (!data) return;
        router.replace(data.url);
      },
    }
  );

  if (link.isLoading) return <p>Redirecting...</p>;

  if (link.isError) return <p>Failed to redirect</p>;

  if (link.data == null) return <p>Invalid Link</p>;
}
