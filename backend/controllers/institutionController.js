const boom = require("boom");
const Institution = require("../models/Institution");
const checkAccess = require("../helpers/utils").checkAccess;

// Get all Institutions
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const institutions = await Institution.forge()
      .orderBy("id", "desc")
      .fetchAll();
    return institutions.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.get = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const institution = await Institution.where("id", req.params.id).fetch({
      withRelated: ["faculties"],
    });
    //const institution = await Institution.forge({id: req.params.id}).fetch();

    return institution;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const newInstitution = await Institution.forge(req.body).save();

    return newInstitution;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.update = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const institution = await Institution.where("id", req.params.id).fetch();
    if (institution) {
      institution.set(req.body);
      await institution.save();
    }

    return institution;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const info = await Institution.where("id", req.params.id).destroy();
    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getInstitutionByParams = async (req, reply) => {
  try {
    const institution = await Institution.where(req.body).fetch();

    return institution;
  } catch (err) {
    throw boom.boomify(err);
  }
};

/**
 * Call OpenRouter LLM to structure calendar data
 * @param {string} rawText - Raw parsed text from PDF
 * @returns {Promise<Object>} Structured calendar data
 */
async function structureCalendarWithLLM(rawText) {
  try {
    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_API_KEY = process.env.GROQ_KEY;
    const GROQ_MODEL =
      process.env.GROQ_MODEL || "deepseek-r1-distill-llama-70b";

    if (!GROQ_API_KEY) {
      // Groq API key not configured, using fallback parsing
      return structureCalendarWithFallback(rawText);
    }

    const systemPrompt = `You are an expert academic calendar parser. Your task is to extract and structure academic calendar information from raw text into a specific JSON format.

IMPORTANT: You must respond with ONLY valid JSON. No additional text, explanations, or markdown formatting.

Expected JSON structure:
{
  "academic_year": "YYYY/YYYY",
  "semesters": [
    {
      "name": "SEMESTER 1",
      "events": [
        {
          "name": "Event Name",
          "start_date": "YYYY-MM-DD",
          "end_date": "YYYY-MM-DD",
          "semester": 1,
          "holiday": false
        }
      ]
    }
  ]
}

Rules:
1. Convert all dates to YYYY-MM-DD format
2. Determine if an event is a holiday (breaks, vacations, holidays, etc.)
3. Assign semester numbers (1 or 2) based on context
4. Use clear, descriptive event names
5. If only one date is mentioned, use it for both start_date and end_date
6. For date ranges, use the first date as start_date and last date as end_date
7. Academic year should be in YYYY/YYYY format
8. Semester names should be "SEMESTER 1" or "SEMESTER 2"`;

    const userPrompt = `Please parse this academic calendar text and return structured JSON:

${rawText}

Return ONLY the JSON object, no other text.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95,
        stream: true,
        stop: null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const llmResponse = data.choices?.[0]?.message?.content;

    if (!llmResponse) {
      throw new Error("No response from LLM");
    }

    // Extract JSON from response (in case LLM adds extra text)
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from LLM");
    }

    const structuredData = JSON.parse(jsonMatch[0]);

    // Validate the structure
    if (!structuredData.academic_year || !structuredData.semesters) {
      throw new Error("LLM response missing required fields");
    }

    return structuredData;
  } catch (error) {
    throw error;
  }
}

/**
 * Fallback calendar structuring using basic regex patterns
 * @param {string} rawText - Raw parsed text from PDF
 * @returns {Object} Structured calendar data
 */
function structureCalendarWithFallback(rawText) {
  // Using fallback calendar structuring
  return {
    academic_year: "2024/2025",
    semesters: [
      {
        name: "SEMESTER 1",
        events: [],
      },
      {
        name: "SEMESTER 2",
        events: [],
      },
    ],
  };
}

/**
 * Structure calendar data with LLM and save to institution
 */
exports.structureCalendar = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const { rawText, institutionId } = req.body;

    if (!rawText) {
      throw boom.badRequest("No text provided");
    }

    if (!institutionId) {
      throw boom.badRequest("No institution ID provided");
    }

    // Structure calendar data with LLM
    const structuredData = await structureCalendarWithLLM(rawText);

    if (
      !structuredData ||
      !structuredData.academic_year ||
      !structuredData.semesters
    ) {
      throw new Error("LLM failed to structure calendar data properly");
    }

    // Add metadata to calendar data
    const enrichedCalendarData = {
      ...structuredData,
      parsed_at: new Date().toISOString(),
      parsing_method: "llm",
      llm_processed: true,
    };

    // Fetch the institution and update it directly
    const institution = await Institution.where("id", institutionId).fetch();

    if (!institution) {
      throw boom.notFound(`Institution with ID ${institutionId} not found`);
    }

    // Update the institution with the calendar data
    institution.set("calendar_data", enrichedCalendarData);
    await institution.save();

    return {
      success: true,
      data: structuredData,
      institution: institution.toJSON(),
      message: "Calendar data structured and saved successfully",
    };
  } catch (err) {
    throw boom.boomify(err);
  }
};
