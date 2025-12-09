import { useSearchParams } from "next/navigation";
import MeetingProvider from "../../components/lms/MeetingProvider";

export default function WebinarV2() {
  const searchParams = useSearchParams();
  const roomNameQ = searchParams.get("roomName");
  const userInfoQ = searchParams.get("userInfo");
  const courseCode = searchParams.get("courseCode");
  const courseName = searchParams.get("courseName");
  const courseId = searchParams.get("courseId");
  const provider = searchParams.get("provider");

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        background: "#000",
      }}
    >
      <MeetingProvider
        roomName={roomNameQ}
        userInfo={userInfoQ}
        courseCode={courseCode}
        courseName={courseName}
        courseId={courseId}
        preferredProvider={provider || "googlemeet"}
      />
    </div>
  );
}
