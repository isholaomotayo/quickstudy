import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { getCoursesByParams } from "../helpers/FetchWrapper";

const AsyncCourseSelect = ({
  value,
  onChange,
  placeholder = "Search for a course...",
  isClearable = true,
  staffId = null,
  ...props
}) => {
  const [defaultOptions, setDefaultOptions] = useState([]);

  // Load default options when component mounts
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        let searchParams = `pgsize=50`;

        if (staffId) {
          searchParams += `&staff_id=${staffId}`;
        }

        const response = await getCoursesByParams(searchParams);
        const courses = await response.json();

        const options = courses.map((course) => ({
          value: course.id,
          label: `${course.code} - ${course.name}`,
          course: course,
        }));

        setDefaultOptions(options);
      } catch (error) {
        console.error("Error loading default courses:", error);
        setDefaultOptions([]);
      }
    };

    loadDefaults();
  }, [staffId]);
  // Function to load course options based on search input
  const loadOptions = async (inputValue) => {
    try {
      let searchParams = `pgsize=50`; // Load 50 courses at a time

      // Add staff filter if provided (for staff pages)
      if (staffId) {
        searchParams += `&staff_id=${staffId}`;
      }

      // Add search filter if user typed something
      if (inputValue && inputValue.trim()) {
        // Search by course name or code
        searchParams += `&search=${encodeURIComponent(inputValue.trim())}`;
      }

      const response = await getCoursesByParams(searchParams);
      const courses = await response.json();

      // Transform courses into react-select format
      const options = courses.map((course) => ({
        value: course.id,
        label: `${course.code} - ${course.name}`,
        course: course, // Keep full course object for use in parent
      }));

      return options;
    } catch (error) {
      console.error("Error loading courses:", error);
      return []; // Return empty array on error
    }
  };

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isClearable={isClearable}
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No courses found for "${inputValue}"`
          : "Start typing to search courses"
      }
      loadingMessage={() => "Loading courses..."}
      {...props}
    />
  );
};

export default AsyncCourseSelect;
