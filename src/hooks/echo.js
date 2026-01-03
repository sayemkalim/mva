import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getItem } from "../utils/local_storage";

window.Pusher = Pusher;

let echoInstance = null;

const createEcho = () => {
  const token = getItem("token");

  if (!token) {
    console.warn("⚠️ No token found. Echo will not connect.");
    return null;
  }

  console.log("🔄 Creating Echo instance with token");

  return new Echo({
    broadcaster: "pusher",
    key: "localkey",
    cluster: "mt1",
    wsHost: "mva-backend.vsrlaw.ca",
    wsPort: 80,
    wssPort: 443,
    forceTLS: true,
    encrypted: true,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    authEndpoint: "https://mva-backend.vsrlaw.ca/api/v2/broadcasting/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

export const getEcho = () => {
  if (!echoInstance) {
    echoInstance = createEcho();
  }
  return echoInstance;
};

export const resetEcho = () => {
  if (echoInstance) {
    console.log(" Disconnecting old Echo instance");
    echoInstance.disconnect();
  }
  echoInstance = null;
  console.log(" Echo reset complete");
};

export default getEcho();
