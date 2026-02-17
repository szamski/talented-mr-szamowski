"use client";

import { storyblokInit, apiPlugin } from "@storyblok/react";
import { type PropsWithChildren } from "react";

export default function StoryblokProvider({ children }: PropsWithChildren) {
  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN,
    use: [apiPlugin],
    bridge: true,
  });

  return <>{children}</>;
}
