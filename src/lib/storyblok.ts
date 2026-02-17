import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";

// SDK init for visual editor bridge only
export const getStoryblokApi = storyblokInit({
  accessToken: process.env.STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  components: {},
});
