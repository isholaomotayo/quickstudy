#!/usr/bin/env node

/**
 * Script to generate Google Meet URLs for all courses that don't have meeting URLs
 * Usage: node scripts/generate-course-meetings.js
 */

require("dotenv").config();
const Course = require("../backend/models/Course");
const CourseMeeting = require("../backend/models/CourseMeeting");
const googleMeetService = require("../backend/services/googleMeetService");

async function generateCourseMeetings() {
  console.log("🚀 Starting course meeting generation...\n");

  try {
    // Get all courses
    const courses = await Course.fetchAll();
    console.log(`📚 Found ${courses.length} total courses`);

    // Get all existing course meetings
    const existingMeetings = await CourseMeeting.fetchAll();
    const coursesWithMeetings = new Set(
      existingMeetings.map((meeting) => meeting.get("course_id"))
    );

    console.log(`🔗 Found ${existingMeetings.length} existing course meetings`);
    console.log(
      `📝 Courses without meetings: ${
        courses.length - coursesWithMeetings.size
      }\n`
    );

    // Filter courses that don't have meetings
    const coursesWithoutMeetings = courses.filter(
      (course) => !coursesWithMeetings.has(course.get("id"))
    );

    if (coursesWithoutMeetings.length === 0) {
      console.log("✅ All courses already have meeting URLs!");
      return;
    }

    console.log(
      `🎯 Generating meetings for ${coursesWithoutMeetings.length} courses...\n`
    );

    let successCount = 0;
    let errorCount = 0;

    // Process courses in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < coursesWithoutMeetings.length; i += batchSize) {
      const batch = coursesWithoutMeetings.slice(i, i + batchSize);

      console.log(
        `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          coursesWithoutMeetings.length / batchSize
        )}`
      );

      // Process batch concurrently
      const batchPromises = batch.map(async (course) => {
        try {
          const courseId = course.get("id");
          const courseCode = course.get("code");
          const courseName = course.get("name");

          console.log(
            `  🔄 Creating meeting for: ${courseCode} - ${courseName}`
          );

          // Create Google Meet URL
          const meetingUrl = await googleMeetService._createOpenMeetSpace();

          // Create Calendar event
          const now = new Date();
          const start = now.toISOString();
          const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration

          let calendarEvent = null;
          try {
            calendarEvent = await googleMeetService.createCalendarEventWithMeet(
              {
                summary: courseName || courseCode,
                description: `Course: ${courseCode} - ${courseName}`,
                start,
                end,
              },
              meetingUrl
            );
          } catch (calError) {
            console.warn(
              `    ⚠️  Calendar event creation failed for ${courseCode}:`,
              calError.message
            );
          }

          // Save to database
          await CourseMeeting.forge({
            course_id: courseId,
            course_code: courseCode,
            meeting_provider: "googlemeet",
            meeting_url: meetingUrl,
            is_active: true,
            is_persistent: true, // Make meetings persistent
            expires_at: null, // No expiration for persistent meetings
            meeting_data: {
              courseName,
              createdAt: new Date().toISOString(),
              calendarEventId: calendarEvent?.id,
              calendarEventLink: calendarEvent?.htmlLink,
              generatedBy: "bulk-script",
            },
          }).save();

          console.log(`    ✅ Success: ${courseCode} - ${meetingUrl}`);
          return { success: true, courseCode, meetingUrl };
        } catch (error) {
          console.error(
            `    ❌ Error for ${course.get("code")}:`,
            error.message
          );
          return {
            success: false,
            courseCode: course.get("code"),
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      // Count results
      batchResults.forEach((result) => {
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      });

      // Add delay between batches to be respectful to the API
      if (i + batchSize < coursesWithoutMeetings.length) {
        console.log("  ⏳ Waiting 2 seconds before next batch...\n");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log("\n📊 Generation Complete!");
    console.log(`✅ Successfully generated: ${successCount} meetings`);
    console.log(`❌ Failed to generate: ${errorCount} meetings`);
    console.log(
      `📈 Success rate: ${(
        (successCount / (successCount + errorCount)) *
        100
      ).toFixed(1)}%`
    );
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateCourseMeetings()
    .then(() => {
      console.log("\n🎉 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { generateCourseMeetings };



