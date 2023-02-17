import type { Link } from "@prisma/client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import Loader from "../components/Loader";
import TrashXIcon from "../components/TrashXIcon";
import { env } from "../env.mjs";
import { api } from "../utils/api";

export default function Home() {
  const session = useSession();

  const [links, setLinks] = useState<Link[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string[]>([]);

  const linksRes = api.links.getLinks.useQuery(undefined, {
    onSuccess: (data) => {
      setLinks(data);
    },
  });
  const createLinkMutation = api.links.createLink.useMutation();
  const deleteLinkMutation = api.links.deleteLink.useMutation();

  const createLink = () => {
    if (url.length < 1) return;
    if (url.toLowerCase().startsWith("api"))
      return setError("URL cannot start with API");
    if (error) setError("");
    setCreating(true);

    createLinkMutation.mutate(
      { url },
      {
        onSuccess: (data) => {
          setLinks((prev) => [data, ...prev]);
          setUrl("");
          setCreating(false);
        },
        onError: () => {
          setError("Failed to create link.");
          setCreating(false);
        },
      }
    );
  };

  const deleteLink = (id: string) => {
    setDeleting((prev) => [...prev, id]);

    deleteLinkMutation.mutate(
      { id },
      {
        onSuccess: () => {
          setLinks((prev) => prev.filter((link) => link.id !== id));
          setDeleting((prev) => prev.filter((x) => x !== id));
        },
        onError: () => {
          setDeleting((prev) => prev.filter((x) => x !== id));
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      {session.data ? (
        <div className="flex h-full flex-col items-center pt-36">
          <header className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <Image
              src={
                session.data.user.image ||
                "https://cdn.discordapp.com/avatars/1.png"
              }
              alt="avatar"
              width={56}
              height={56}
              className="rounded-full"
            />
            <h1 className="text-center text-5xl font-bold md:text-left">
              Logged in as {session.data.user.name}
            </h1>
          </header>

          <div className="mt-18 mt-24 flex flex-col items-center">
            <input
              type="text"
              placeholder="https://example.com"
              className="font w-96 rounded-md border-2 border-gray-700 bg-transparent px-6 py-4 text-center text-lg outline-none duration-200 focus:border-gray-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              disabled={creating}
              className={`relative mt-4 rounded-md border-2 px-4 py-3 text-lg font-medium text-black duration-200 ${
                !creating
                  ? "border-white bg-white hover:bg-transparent hover:text-white"
                  : "cursor-not-allowed border-gray-400 bg-gray-400"
              } `}
              onClick={createLink}
            >
              {creating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader size={32} color="teal" />
                </div>
              )}
              Create Short Link
            </button>

            <p className="mt-2 text-lg text-red-400">{error}</p>
          </div>

          <div className="mt-24 flex flex-col items-center">
            <h3 className="text-3xl font-bold">My Links</h3>
            {linksRes.isLoading && (
              <div className="mt-4 flex flex-col items-center">
                <Loader size={38} color="teal" />
                <p>Loading links...</p>
              </div>
            )}
            {links.map((link) => (
              <div
                key={link.id}
                className="min-w-96 my-6 flex items-center gap-6 rounded-md bg-neutral-900 p-6"
              >
                <p>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                    href={`${env.NEXT_PUBLIC_CLIENT_URL}/${link.id}`}
                  >
                    {env.NEXT_PUBLIC_CLIENT_URL}/{link.id}
                  </a>{" "}
                  <span className="text-gray-300">redirects to </span>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                    href={link.url}
                  >
                    {link.url}
                  </a>
                </p>
                <div>
                  {deleting.includes(link.id) ? (
                    <Loader size={24} color="teal" />
                  ) : (
                    <div
                      className="relative cursor-pointer rounded-md p-1 hover:bg-gray-500"
                      onClick={() => deleteLink(link.id)}
                    >
                      <TrashXIcon />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {links.length < 1 && !linksRes.isLoading && (
              <p className="mt-2 text-center">You have no links</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-screen items-center justify-center">
          <button
            className="rounded-md border-2 border-white bg-white px-6 py-4 text-lg font-medium text-black duration-200 hover:bg-transparent hover:text-white"
            onClick={() => signIn("discord")}
          >
            Login to Start Shortening Links
          </button>
        </div>
      )}
    </div>
  );
}
