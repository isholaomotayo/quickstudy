import React, { useState, useEffect } from "react";
import AnnouncementReadMorePopup from "../announcements/AnnouncementReadMorePopup";
import fetch from "isomorphic-unfetch";
import Link from "next/link";

const Announcement = props => {
  const [announcement, setAnnouncement] = useState([]);
  const fetchData = async () => {
    const res = await fetch(
      `${process.env.API_URL}/api/courseAnnouncement?course_id=${props.id}`,
      {
        method: "get",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

    const data = await res.json();
    //console.log(data);
    if (data.error) {
      return setAnnouncement([]);
    }
    setAnnouncement(data);
  };
  useEffect(() => {
    fetchData();
  }, []);
  const fourAnnouncements = announcement
    .sort((a, b) => b.id - a.id)
    .filter((x, i) => i < 4);
  return <>
    {/* START ITEM */}
    <div
      className="card social-card status "
      data-social="item"
      style={{ width: "100%" }}
    >
      <h2
        className="lead  border-bottom mb-3 text-left pb-3"
        style={{ fontSize: "1.25rem !important" }}
      >
        Announcements
      </h2>
      {fourAnnouncements.map((announcements, i) => {
        return (
          <div key={i}>
            <AnnouncementReadMorePopup
              key={announcements.id}
              i={i + 1}
              announcement={announcements}
            />
          </div>
        );
      })}
      <div>
        <Link href={`/lms/announcement?course_id=${props.id}`} legacyBehavior>
          <a className="btn btn-complete btn-md float-right">More</a>
        </Link>
      </div>
    </div>
    <style jsx>
      {`
        h2 {
          font-size: 1.25rem !important;
        }
      `}
    </style>
  </>;
};
Announcement.getInitialProps = async ({ query }) => {
  fetchData();
};
export default Announcement;
