const Level = require("../models/Level");
const Semester = require("../models/Semester");

/**
 * Centralized service for calculating student current level
 * This ensures consistent level calculation across the platform
 */
class LevelCalculationService {
  
  /**
   * Calculate the current level ID for a student
   * @param {number} studentId - Student ID
   * @param {number} semesterAdmittedId - ID of semester when student was admitted
   * @param {number} entryLevelId - Entry level ID of the student
   * @param {number} institutionId - Institution ID for validation
   * @returns {Promise<{levelId: number, levelDisplay: number, currentSemesterId: number}>}
   */
  static async calculateStudentCurrentLevel(studentId, semesterAdmittedId, entryLevelId, institutionId) {
    try {
      // Get current active semester
      const currentSemester = await Semester.where({
        is_active: true,
        institution_id: institutionId,
      }).fetch();

      if (!currentSemester) {
        throw new Error('No active semester found');
      }

      const currentSemesterId = currentSemester.get('id');
      
      // Calculate level progression based on semesters
      const semestersDifference = currentSemesterId - parseInt(semesterAdmittedId);
      const calculatedLevelId = Math.max(1, parseInt(entryLevelId) + Math.floor(semestersDifference / 2));
      
      // Validate against actual levels in database
      const validLevels = await Level.fetchAll();
      const validLevelIds = validLevels.models.map(level => level.get('id'));
      
      let finalLevelId;
      if (validLevelIds.includes(calculatedLevelId)) {
        finalLevelId = calculatedLevelId;
      } else {
        // Find closest valid level ID
        finalLevelId = validLevelIds.reduce((closest, levelId) => {
          return Math.abs(levelId - calculatedLevelId) < Math.abs(closest - calculatedLevelId) 
            ? levelId : closest;
        }, validLevelIds[0]);
        
        console.warn(`Student ${studentId}: Calculated level ID ${calculatedLevelId} not found in database, using ${finalLevelId}`);
      }
      
      return {
        levelId: finalLevelId,
        levelDisplay: finalLevelId * 100, // Display format (100, 200, 300, etc.)
        currentSemesterId: currentSemesterId,
        semesterName: currentSemester.get('name')
      };
      
    } catch (error) {
      console.error('Error calculating student level:', error);
      
      // Fallback to entry level
      return {
        levelId: parseInt(entryLevelId),
        levelDisplay: parseInt(entryLevelId) * 100,
        currentSemesterId: null,
        semesterName: null,
        error: error.message
      };
    }
  }

  /**
   * Get all available levels from database
   * @returns {Promise<Array>} Array of level objects
   */
  static async getAvailableLevels() {
    try {
      const levels = await Level.fetchAll();
      return levels.models.map(level => ({
        id: level.get('id'),
        name: level.get('name'),
        // Add any other level attributes you need
      }));
    } catch (error) {
      console.error('Error fetching available levels:', error);
      return [];
    }
  }

  /**
   * Validate if a level ID exists in the database
   * @param {number} levelId - Level ID to validate
   * @returns {Promise<boolean>} True if level exists
   */
  static async isValidLevelId(levelId) {
    try {
      const level = await Level.where('id', levelId).fetch();
      return !!level;
    } catch (error) {
      console.error('Error validating level ID:', error);
      return false;
    }
  }
}

module.exports = LevelCalculationService;