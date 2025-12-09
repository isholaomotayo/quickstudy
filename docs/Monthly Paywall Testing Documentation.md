## Monthly Paywall Testing Documentation

Overview

This document provides comprehensive testing procedures for the new monthly payment paywall
system that implements a 50% payment threshold based on program progress.

---

🔧 Test Setup Requirements

Prerequisites

1. Development Environment: Running backend server
2. Database Access: Ability to modify student and payment records
3. API Testing Tool: Postman, curl, or similar
4. Admin Access: To modify payment records and student data

Test Data Requirements

- Test student accounts with various admission dates
- Payment records with monthly fee plans
- Active semesters and sessions
- Fee records with monthly payment structures

---

📊 Test Scenarios

Scenario 1: Early Program Student (3 months)

Setup:
-- Student admitted 3 months ago
UPDATE student
SET semester_admitted_id = [semester_id_3_months_ago]
WHERE id = [test_student_id];

-- Payment record with 2 monthly installments paid
INSERT INTO payment2 (student_id, reference, cart, status, paid_at)
VALUES ([test_student_id], 'TEST-123m2', '{"1": {"fee_plan": "monthly"}}', 1, NOW());

Expected Result:

- Progress: 3 months
- Minimum Required: floor(3 × 0.5) = 1 payment
- Student Paid: 2 payments
- ACCESS: GRANTED ✅

Test Command:
curl -X GET "http://localhost:3000/api/protected-endpoint" \
 -H "Cookie: token=[student_token]; role=STUDENT"

---

Scenario 2: Mid-Program Student - Sufficient Payments (8 months)

Setup:
-- Student admitted 8 months ago
UPDATE student
SET semester_admitted_id = [semester_id_8_months_ago]
WHERE id = [test_student_id];

-- Payment record with 4 monthly installments paid
INSERT INTO payment2 (student_id, reference, cart, status, paid_at)
VALUES ([test_student_id], 'TEST-456m4', '{"1": {"fee_plan": "monthly"}}', 1, NOW());

Expected Result:

- Progress: 8 months
- Minimum Required: floor(8 × 0.5) = 4 payments
- Student Paid: 4 payments
- ACCESS: GRANTED ✅

---

Scenario 3: Mid-Program Student - Insufficient Payments (10 months)

Setup:
-- Student admitted 10 months ago
UPDATE student
SET semester_admitted_id = [semester_id_10_months_ago]
WHERE id = [test_student_id];

-- Payment record with only 3 monthly installments paid
INSERT INTO payment2 (student_id, reference, cart, status, paid_at)
VALUES ([test_student_id], 'TEST-789m3', '{"1": {"fee_plan": "monthly"}}', 1, NOW());

Expected Result:

- Progress: 10 months
- Minimum Required: floor(10 × 0.5) = 5 payments
- Student Paid: 3 payments
- ACCESS: DENIED ❌ (HTTP 402)

---

Scenario 4: Late Program Student (15 months)

Setup:
-- Student admitted 15 months ago
UPDATE student
SET semester_admitted_id = [semester_id_15_months_ago]
WHERE id = [test_student_id];

-- Payment record with 7 monthly installments paid
INSERT INTO payment2 (student_id, reference, cart, status, paid_at)
VALUES ([test_student_id], 'TEST-101m7', '{"1": {"fee_plan": "monthly"}}', 1, NOW());

Expected Result:

- Progress: 15 months
- Minimum Required: floor(15 × 0.5) = 7 payments
- Student Paid: 7 payments
- ACCESS: GRANTED ✅

---

Scenario 5: Program Completion (18+ months)

Setup:
-- Student admitted 20 months ago (beyond 18-month program)
UPDATE student
SET semester_admitted_id = [semester_id_20_months_ago]
WHERE id = [test_student_id];

-- Payment record with 9 monthly installments paid
INSERT INTO payment2 (student_id, reference, cart, status, paid_at)
VALUES ([test_student_id], 'TEST-202m9', '{"1": {"fee_plan": "monthly"}}', 1, NOW());

Expected Result:

- Progress: 20 months (capped at 18)
- Minimum Required: floor(18 × 0.5) = 9 payments
- Student Paid: 9 payments
- ACCESS: GRANTED ✅

---

Scenario 6: Edge Case - No Admission Semester

Setup:
-- Student with no semester_admitted_id
UPDATE student
SET semester_admitted_id = NULL
WHERE id = [test_student_id];

Expected Result:

- Falls back to session start date
- ACCESS: GRANTED ✅ (graceful fallback)

---

🧪 Testing Procedures

1. Console Log Verification

Monitor server logs for debug output:
{
studentId: 123,
semesterAdmittedId: 45,
programStartDate: '2023-01-15T00:00:00.000Z',
progressMonths: 10,
minimumRequired: 5,
lastInstallment: 4,
maxPayments: 12,
allowAccess: false
}

2. API Response Testing

Success Response (200):
{
"data": "Protected content accessed successfully"
}

Paywall Block (402):
{
"error": "Payment Required",
"code": 402,
"message": "Payment Required",
"statusCode": 402
}

3. Database Verification Queries

-- Verify student admission data
SELECT s.id, s.semester_admitted_id, sem.start_date, sem.name
FROM student s
JOIN semester sem ON s.semester_admitted_id = sem.id
WHERE s.id = [test_student_id];

-- Verify payment records
SELECT p.id, p.reference, p.cart, p.status, p.paid_at
FROM payment2 p
WHERE p.student_id = [test_student_id]
AND p.status = 1
ORDER BY p.paid_at DESC;

-- Check fee configuration
SELECT f.id, f.monthly_parts
FROM fee f
WHERE f.id = [fee_id];

---

⚠️ Testing Considerations

Date Calculations

- Ensure test semesters have realistic start dates
- Account for month differences in calculations
- Test across month boundaries (e.g., end of month scenarios)

Payment References

- Use correct reference format: PREFIX-IDmINSTALLMENT
- Example: TEST-123m4 = monthly plan, 4th installment
- Ensure cart JSON contains fee_plan: "monthly"

Fee Configuration

- Verify fee records have monthly_parts field set
- Test with different monthly_parts values

Institution Settings

- Ensure paywall_on is enabled in institution settings
- Test with paywall disabled (should allow all access)

---

🚨 Error Scenarios to Test

1. Missing Data

- Student without semester_admitted_id
- Missing semester records
- Corrupted payment references
- Missing fee records

2. Invalid Data

- Future admission dates
- Negative payment amounts
- Invalid payment references
- Malformed cart JSON

3. Edge Cases

- Students admitted exactly 18 months ago
- Zero payments made
- Payments exceeding maximum
- Multiple payment records

---

📈 Performance Testing

Load Testing

# Test multiple concurrent requests

for i in {1..50}; do
curl -X GET "http://localhost:3000/api/protected-endpoint" \
 -H "Cookie: token=[student_token]" &
done
wait

Database Performance

- Monitor query execution times
- Check for N+1 query issues
- Verify index usage on semester and payment lookups

---

✅ Validation Checklist

- Early program students with minimal payments get access
- Mid program students need proportional payments
- Late program students need higher payment counts
- Program completion logic works (18+ months)
- Graceful handling of missing data
- Console logging provides useful debug info
- API responses match expected formats
- Performance is acceptable under load
- Edge cases don't break the system
- Different payment plans (semesterly, sessionly) still work

---

🔍 Debugging Tips

Common Issues

1. Date Format Problems: Ensure dates are properly parsed
2. Integer Conversion: Check +lastInstallment conversions
3. Async/Await: Verify all database calls are properly awaited
4. Reference Parsing: Validate payment reference formats

Debug Commands

// Add temporary logging in checkPaymentCurrent
console.log('Student:', validatedUser.student);
console.log('Last Payment:', lastFeePaid);
console.log('Fee Plan:', lastFeePlan);
console.log('Installments:', lastInstallment);

This comprehensive testing approach will ensure the new monthly paywall system works
correctly across all scenarios and edge cases.
