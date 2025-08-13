// import chat from "./chat";
import user from "./user";
import messages from "./messages";
import channel_store from "./channel_store";

document.addEventListener("alpine:init", () => {
  Alpine.store("channel", channel_store);

  Alpine.data("chat", () => ({
    ...user(),
    ...messages(),
  }));
});
