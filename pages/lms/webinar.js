import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { getCookies } from "cookies-next";
const JaaSMeeting = dynamic(
  () => import("@jitsi/react-sdk").then(({ JaaSMeeting }) => JaaSMeeting),
  {
    ssr: false,
  }
);

export default ({
  roomName = "Live Classroom",
  userInfo = "University Of Nigeria Nsukka",
}) => {
  const searchParams = useSearchParams();

  const userInfoQ = searchParams.get("userInfo");
  const roomNameQ = searchParams.get("roomName");

  return (
    <JaaSMeeting
      // domain={"applications.unn.edu.ng"}
      roomName={`vpaas-magic-cookie-f23cdcd0b28640c69d79e5d090885939/${roomNameQ}`}
      configOverwrite={{
        startWithAudioMuted: true,
        disableModeratorIndicator: true,
        startScreenSharing: true,
        enableEmailInStats: false,
      }}
      interfaceConfigOverwrite={{
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      }}
      userInfo={{
        displayName: userInfoQ ?? userInfo,
      }}
      onApiReady={(externalApi) => {
        // here you can attach custom event listeners to the Jitsi Meet External API
        // you can also store it locally to execute commands
      }}
      getIFrameRef={(iframeRef) => {
        iframeRef.style.height = "1000px";
      }}
    />
  );
};
