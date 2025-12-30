import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!institutionId) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    // Get institution with calendar data
    const institution = await prisma.institution.findUnique({
      where: { id: parseInt(institutionId) },
      select: {
        id: true,
        name: true,
        calendar_data: true
      }
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    let events: any[] = [];
    let totalCount = 0;

    // Extract events from calendar_data if available
    if (institution.calendar_data && typeof institution.calendar_data === 'object') {
      const calendarData = institution.calendar_data as any;
      
      // Handle nested semester structure
      let allEvents: any[] = [];
      
      if (calendarData.semesters && Array.isArray(calendarData.semesters)) {
        // Extract events from semester-based structure
        calendarData.semesters.forEach((semester: any) => {
          if (semester.events && Array.isArray(semester.events)) {
            semester.events.forEach((event: any) => {
              allEvents.push({
                ...event,
                semesterName: semester.name,
                academic_year: calendarData.academic_year
              });
            });
          }
        });
      } else {
        // Fallback to flat structure if it exists
        allEvents = [
          ...(calendarData.events || []),
          ...(calendarData.exam_periods || []).map((exam: any) => ({ ...exam, type: 'exam' })),
          ...(calendarData.registration_periods || []).map((reg: any) => ({ ...reg, type: 'registration' })),
          ...(calendarData.holidays || []).map((holiday: any) => ({ ...holiday, type: 'holiday' })),
        ];
      }

      // Filter events based on query parameters
      let filteredEvents = allEvents;

      if (type) {
        filteredEvents = filteredEvents.filter(event => event.type === type);
      }

      if (status) {
        const now = new Date();
        filteredEvents = filteredEvents.filter(event => {
          if (!event.date && !event.start_date) return false;
          
          const eventDate = new Date(event.date || event.start_date);
          const isUpcoming = eventDate > now;
          const isOngoing = event.end_date ? 
            eventDate <= now && new Date(event.end_date) >= now : 
            false;
          const isPast = eventDate < now && !isOngoing;

          if (status === 'upcoming') return isUpcoming;
          if (status === 'ongoing') return isOngoing;
          if (status === 'completed') return isPast;
          return true;
        });
      }

      // Date range filter
      if (startDate || endDate) {
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date || event.start_date || event.created_at || Date.now());
          
          if (startDate && eventDate < new Date(startDate)) return false;
          if (endDate && eventDate > new Date(endDate)) return false;
          
          return true;
        });
      }

      totalCount = filteredEvents.length;

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);

      // Transform events to consistent format
      events = paginatedEvents.map((event, index) => {
        const eventDate = new Date(event.start_date || event.date || Date.now());
        const endDate = event.end_date ? new Date(event.end_date) : null;
        const now = new Date();
        
        let eventStatus = 'completed';
        if (endDate && eventDate <= now && endDate >= now) {
          eventStatus = 'ongoing';
        } else if (eventDate > now) {
          eventStatus = 'upcoming';
        }

        // Determine event type based on name and properties
        let eventType = 'event';
        const eventName = (event.name || event.title || '').toLowerCase();
        
        if (event.holiday === true || eventName.includes('break') || eventName.includes('holiday')) {
          eventType = 'holiday';
        } else if (eventName.includes('exam') || eventName.includes('test')) {
          eventType = 'exam';
        } else if (eventName.includes('registration') || eventName.includes('admission')) {
          eventType = 'registration';
        } else if (eventName.includes('matriculation') || eventName.includes('graduation')) {
          eventType = 'meeting';
        } else if (eventName.includes('school') || eventName.includes('revision')) {
          eventType = 'assignment';
        }

        return {
          id: `calendar-${index}-${Date.now()}`,
          title: event.name || event.title || event.event || 'Unnamed Event',
          description: event.description || event.details || event.name || '',
          type: eventType,
          status: eventStatus,
          eventDate: eventDate.toISOString(),
          endDate: endDate?.toISOString() || null,
          department: null, // Calendar events are institution-wide
          createdBy: {
            name: 'System',
            role: 'SYSTEM'
          },
          priority: event.priority || 'medium',
          isPublic: true,
          location: event.location || null,
          duration: event.duration || null,
          semester: event.semester || null,
          semesterName: event.semesterName || null,
          academicYear: event.academic_year || calendarData.academic_year || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
    }

    // Academic events come only from calendar_data - no fallback to announcements

    // Generate statistics
    const eventTypeStats = events.reduce((acc: any, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    const statusStats = events.reduce((acc: any, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});

    const statistics = {
      totalEvents: totalCount,
      upcomingEvents: statusStats.upcoming || 0,
      ongoingEvents: statusStats.ongoing || 0,
      completedEvents: statusStats.completed || 0,
      eventTypes: eventTypeStats,
      hasCalendarData: !!(institution.calendar_data && typeof institution.calendar_data === 'object' && 
        ((institution.calendar_data as any).semesters || (institution.calendar_data as any).events))
    };

    return NextResponse.json({
      events,
      statistics,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      institution: {
        id: institution.id,
        name: institution.name,
        hasCalendarData: !!(institution.calendar_data && typeof institution.calendar_data === 'object' && 
        ((institution.calendar_data as any).semesters || (institution.calendar_data as any).events))
      }
    });

  } catch (error) {
    console.error('Error fetching academic events:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch academic events', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST endpoint to create new academic events in calendar_data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      body: content, 
      institutionId, 
      userId,
      type = 'event',
      eventDate,
      endDate,
      location,
      priority = 'medium',
      semester = 1
    } = body;

    if (!title || !content || !institutionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body, institutionId, userId' },
        { status: 400 }
      );
    }

    // Get the institution and its current calendar data
    const institution = await prisma.institution.findUnique({
      where: { id: parseInt(institutionId) },
      select: {
        id: true,
        name: true,
        calendar_data: true
      }
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    // Parse existing calendar data or create new structure
    let calendarData: any = {};
    if (institution.calendar_data && typeof institution.calendar_data === 'object') {
      calendarData = institution.calendar_data as any;
    } else {
      // Initialize calendar data structure if it doesn't exist
      const currentYear = new Date().getFullYear();
      calendarData = {
        academic_year: `${currentYear}/${currentYear + 1}`,
        semesters: [
          {
            name: "SEMESTER 1",
            events: []
          },
          {
            name: "SEMESTER 2", 
            events: []
          }
        ]
      };
    }

    // Ensure semester structure exists
    if (!calendarData.semesters || !Array.isArray(calendarData.semesters)) {
      const currentYear = new Date().getFullYear();
      calendarData.semesters = [
        {
          name: "SEMESTER 1",
          events: calendarData.events || []
        },
        {
          name: "SEMESTER 2",
          events: []
        }
      ];
      // Remove old events array if it exists
      delete calendarData.events;
    }

    // Create new event object
    const newEvent = {
      name: title,
      start_date: eventDate || new Date().toISOString().split('T')[0],
      end_date: endDate || null,
      semester: semester,
      holiday: type === 'holiday',
      description: content,
      type: type,
      location: location || null,
      priority: priority,
      created_by: parseInt(userId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add event to the correct semester
    const semesterIndex = semester - 1; // Convert 1-based to 0-based index
    if (calendarData.semesters[semesterIndex] && calendarData.semesters[semesterIndex].events) {
      calendarData.semesters[semesterIndex].events.push(newEvent);
    } else {
      // Fallback: ensure semester has events array
      if (!calendarData.semesters[semesterIndex]) {
        calendarData.semesters[semesterIndex] = {
          name: `SEMESTER ${semester}`,
          events: []
        };
      }
      if (!calendarData.semesters[semesterIndex].events) {
        calendarData.semesters[semesterIndex].events = [];
      }
      calendarData.semesters[semesterIndex].events.push(newEvent);
    }

    // Update institution with new calendar data
    await prisma.institution.update({
      where: { id: parseInt(institutionId) },
      data: {
        calendar_data: calendarData
      }
    });

    // Get user details for response
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        first_name: true,
        last_name: true,
        role: true
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: newEvent.name,
        description: newEvent.description,
        type: newEvent.type,
        status: 'upcoming',
        eventDate: newEvent.start_date,
        endDate: newEvent.end_date,
        location: newEvent.location,
        priority: newEvent.priority,
        semester: newEvent.semester,
        holiday: newEvent.holiday,
        createdBy: user ? {
          name: `${user.first_name} ${user.last_name}`,
          role: user.role
        } : null,
        createdAt: newEvent.created_at,
        updatedAt: newEvent.updated_at
      }
    });

  } catch (error) {
    console.error('Error creating academic event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create academic event', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT endpoint to update existing academic events in calendar_data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventId,
      title, 
      body: content, 
      institutionId, 
      userId,
      type,
      eventDate,
      endDate,
      location,
      priority
    } = body;

    if (!eventId || !title || !content || !institutionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, title, body, institutionId, userId' },
        { status: 400 }
      );
    }

    // Get the institution and its current calendar data
    const institution = await prisma.institution.findUnique({
      where: { id: parseInt(institutionId) },
      select: {
        id: true,
        name: true,
        calendar_data: true
      }
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    // Parse existing calendar data
    let calendarData: any = {};
    if (institution.calendar_data && typeof institution.calendar_data === 'object') {
      calendarData = institution.calendar_data as any;
    }

    if (!calendarData.events) {
      return NextResponse.json(
        { error: 'No events found in calendar data' },
        { status: 404 }
      );
    }

    // Find and update the event
    const eventIndex = calendarData.events.findIndex((event: any) => event.id === eventId);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update event object
    const updatedEvent = {
      ...calendarData.events[eventIndex],
      name: title,
      title: title,
      description: content,
      details: content,
      type: type || calendarData.events[eventIndex].type,
      date: eventDate || calendarData.events[eventIndex].date,
      start_date: eventDate || calendarData.events[eventIndex].start_date,
      end_date: endDate !== undefined ? endDate : calendarData.events[eventIndex].end_date,
      location: location !== undefined ? location : calendarData.events[eventIndex].location,
      priority: priority || calendarData.events[eventIndex].priority,
      updated_at: new Date().toISOString()
    };

    // Replace the event in the array
    calendarData.events[eventIndex] = updatedEvent;

    // Update institution with modified calendar data
    await prisma.institution.update({
      where: { id: parseInt(institutionId) },
      data: {
        calendar_data: calendarData
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        type: updatedEvent.type,
        eventDate: updatedEvent.date,
        endDate: updatedEvent.end_date,
        location: updatedEvent.location,
        priority: updatedEvent.priority,
        updatedAt: updatedEvent.updated_at
      }
    });

  } catch (error) {
    console.error('Error updating academic event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update academic event', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE endpoint to remove academic events from calendar_data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const institutionId = searchParams.get('institutionId');

    if (!eventId || !institutionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: eventId, institutionId' },
        { status: 400 }
      );
    }

    // Get the institution and its current calendar data
    const institution = await prisma.institution.findUnique({
      where: { id: parseInt(institutionId) },
      select: {
        id: true,
        name: true,
        calendar_data: true
      }
    });

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    // Parse existing calendar data
    let calendarData: any = {};
    if (institution.calendar_data && typeof institution.calendar_data === 'object') {
      calendarData = institution.calendar_data as any;
    }

    if (!calendarData.events) {
      return NextResponse.json(
        { error: 'No events found in calendar data' },
        { status: 404 }
      );
    }

    // Find and remove the event
    const eventIndex = calendarData.events.findIndex((event: any) => event.id === eventId);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Remove the event from the array
    calendarData.events.splice(eventIndex, 1);

    // Update institution with modified calendar data
    await prisma.institution.update({
      where: { id: parseInt(institutionId) },
      data: {
        calendar_data: calendarData
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting academic event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete academic event', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
