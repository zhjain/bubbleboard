import socket from "./user_socket";
export default {
  chan: null,
  init() {
    this.chan = socket.channel("room:lobby", {
      user: localStorage.getItem("username") || "匿名",
    });
    this.chan
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
  },
};
