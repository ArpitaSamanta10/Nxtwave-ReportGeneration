# Supabase Schema Fix for Metrics Tables

## Problem
The `metrics_above_average` table has columns with **boolean** data types, but the application is trying to save **JSON arrays** to them.

Error indicator:
```
invalid input syntax for type boolean: "[{\"date\":\"2026-03-26\",\"status\":\"completed\",\"confidenceLevel\":3,\"note\":\"qwertyui\"}]"
```

## Diagnosis
The application now includes field-level diagnostics. When you try to save Above Average remarks and get an error, the browser console will show:
- ✓ Working fields 
- ✗ Failing fields with specific errors

## Solution
Run the following SQL in your Supabase SQL Editor to fix the schema:

### For metrics_above_average table:
```sql
-- Fix revision_attendance_log column (if boolean, change to JSONB)
ALTER TABLE metrics_above_average 
ALTER COLUMN revision_attendance_log TYPE JSONB USING revision_attendance_log::JSONB;

-- Fix mentor_weekly_observation column (if boolean, change to JSONB)
ALTER TABLE metrics_above_average 
ALTER COLUMN mentor_weekly_observation TYPE JSONB USING mentor_weekly_observation::JSONB;

-- Ensure other JSON columns are JSONB type
ALTER TABLE metrics_above_average 
ALTER COLUMN score_improvement_trend TYPE JSONB USING score_improvement_trend::JSONB;

ALTER TABLE metrics_above_average 
ALTER COLUMN problem_level_gap_analysis TYPE JSONB USING problem_level_gap_analysis::JSONB;

ALTER TABLE metrics_above_average 
ALTER COLUMN placement_window_timeline TYPE JSONB USING placement_window_timeline::JSONB;
```

### Steps to apply:
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL above
5. Click "Run" button
6. Refresh the application

## Alternative: Check current column types

To see what type each column actually is, run this query:

```sql
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'metrics_above_average'
ORDER BY column_name;
```

This will show you which columns need fixing.

## For Other Metrics Tables

Apply similar fixes to these tables if needed:

```sql
-- For metrics_good table
ALTER TABLE metrics_good 
ALTER COLUMN justification TYPE TEXT USING justification::TEXT;

-- For metrics_average table  
ALTER TABLE metrics_average
ALTER COLUMN phase_wise_readiness_signal TYPE TEXT USING phase_wise_readiness_signal::TEXT;

-- For metrics_poor table
ALTER TABLE metrics_poor
ALTER COLUMN project_submission_status TYPE JSONB USING project_submission_status::JSONB;

ALTER TABLE metrics_poor
ALTER COLUMN key_learning_areas_focus TYPE JSONB USING key_learning_areas_focus::JSONB;

ALTER TABLE metrics_poor
ALTER COLUMN doubt_raising_frequency TYPE JSONB USING doubt_raising_frequency::JSONB;
```

## Field Mapping Reference

### metrics_above_average table should have:
| Column | Expected Type | Content Example |
|--------|--------------|-----------------|
| evaluation_id | UUID | (primary key reference) |
| score_improvement_trend | JSONB | `[{"topic":"DSA","current":85,"previous":80,...}]` |
| revision_attendance_log | JSONB | `[{"date":"2026-03-26","status":"completed",...}]` |
| mentor_weekly_observation | JSONB | `[{"week":1,"observations":"Strong progress",...}]` |
| problem_level_gap_analysis | JSONB | `[{"level":"L1","gap":"30%",...}]` |
| placement_window_timeline | JSONB | `[{"week":1,"status":"Improving",...}]` |

## After Fixing Schema

Once you've fixed the schema:
1. Restart the application (`npm run dev`)
2. Try saving Above Average remarks again
3. The data should now save successfully

The application has fallback logic that will save compatible fields even if some fail, but all should work once the schema is corrected.
