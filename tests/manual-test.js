/**
 * Manual test script for level calculation functionality
 * Run this to test the actual API endpoints and services
 */

const LevelCalculationService = require('../backend/services/levelCalculationService');

// Mock the database models for manual testing
jest.mock('../backend/models/Level');
jest.mock('../backend/models/Semester');

const Level = require('../backend/models/Level');
const Semester = require('../backend/models/Semester');

async function runManualTests() {
  console.log('🧪 Running Manual Level Calculation Tests...\n');

  // Setup mock data
  const mockLevels = [
    { get: () => 1 },
    { get: () => 2 },
    { get: () => 3 },
    { get: () => 4 }
  ];

  const mockSemester = {
    get: (key) => {
      if (key === 'id') return 8;
      if (key === 'name') return 'Spring 2024';
      return null;
    }
  };

  Level.fetchAll = jest.fn().mockResolvedValue({ models: mockLevels });
  Semester.where = jest.fn().mockReturnValue({
    fetch: jest.fn().mockResolvedValue(mockSemester)
  });

  // Test cases
  const testCases = [
    {
      name: 'New Student (First Semester)',
      studentId: 123,
      semesterAdmittedId: 8,
      entryLevelId: 1,
      institutionId: 1,
      expected: { levelId: 1, levelDisplay: 100 }
    },
    {
      name: 'Second Year Student',
      studentId: 456,
      semesterAdmittedId: 4,
      entryLevelId: 1,
      institutionId: 1,
      expected: { levelId: 3, levelDisplay: 300 }
    },
    {
      name: 'Graduate Entry Student',
      studentId: 789,
      semesterAdmittedId: 6,
      entryLevelId: 2,
      institutionId: 1,
      expected: { levelId: 3, levelDisplay: 300 }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📝 Testing: ${testCase.name}`);
      console.log(`   Student ID: ${testCase.studentId}`);
      console.log(`   Admitted Semester: ${testCase.semesterAdmittedId}`);
      console.log(`   Entry Level: ${testCase.entryLevelId}`);

      const result = await LevelCalculationService.calculateStudentCurrentLevel(
        testCase.studentId,
        testCase.semesterAdmittedId,
        testCase.entryLevelId,
        testCase.institutionId
      );

      console.log(`   📊 Result:`);
      console.log(`     Level ID: ${result.levelId}`);
      console.log(`     Display Level: ${result.levelDisplay}`);
      console.log(`     Current Semester: ${result.currentSemesterId}`);
      console.log(`     Semester Name: ${result.semesterName}`);

      // Verify results
      const passed = result.levelId === testCase.expected.levelId && 
                    result.levelDisplay === testCase.expected.levelDisplay;
      
      console.log(`   ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (!passed) {
        console.log(`     Expected: Level ${testCase.expected.levelId}, Display ${testCase.expected.levelDisplay}`);
        console.log(`     Got: Level ${result.levelId}, Display ${result.levelDisplay}`);
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  console.log('🏁 Manual tests completed!\n');
}

// Export for potential use in other test files
module.exports = { runManualTests };

// Run if this file is executed directly
if (require.main === module) {
  runManualTests().catch(console.error);
}