import { useState, useEffect } from "react";

export default function FormFields({ formData, handleChange, disabled }) {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch departments and positions on component mount
  useEffect(() => {
    async function fetchDepartmentsAndPositions() {
      setIsLoading(true);
      try {
        // Fetch departments
        const deptResponse = await fetch('/api/admin/departments');
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData.departments || []);
        }

        // Fetch positions
        const posResponse = await fetch('/api/admin/positions');
        if (posResponse.ok) {
          const posData = await posResponse.json();
          setPositions(posData.positions || []);
        }
      } catch (error) {
        console.error("Failed to fetch departments or positions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDepartmentsAndPositions();
  }, []);

  // Handle name input to convert to uppercase
  const handleNameChange = (e) => {
    const { name, value } = e.target;
    
    // Create a new event-like object with uppercase value
    const modifiedEvent = {
      target: {
        name,
        value: value.toUpperCase()
      }
    };
    
    // Call the original handleChange with our modified event
    handleChange(modifiedEvent);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Ashima ID */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Ashima ID</label>
        <input
          type="text"
          name="ashima_id"
          value={formData.ashima_id}
          onChange={handleChange}
          required
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none ${
            disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
          }`}
          disabled={disabled}
        />
      </div>

      {/* Name  */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Department */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Department</label>
        {isLoading ? (
          <div className="w-full px-4 py-2 border rounded-md bg-gray-100">Loading...</div>
        ) : (
          <select
            name="department_id"
            value={formData.department_id || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"

          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Position */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Position</label>
        {isLoading ? (
          <div className="w-full px-4 py-2 border rounded-md bg-gray-100">Loading...</div>
        ) : (
          <select
            name="position_id"
            value={formData.position_id || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
          >
            <option value="">Select Position</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* RFID Tag */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">RFID Tag</label>
        <input
          type="text"
          name="rfid_tag"
          value={formData.rfid_tag}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none ${
            disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
          }`}
          disabled={disabled}
        />
      </div> 

      {/* Employee Status */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Employee Status</label>
        <select
          name="emp_stat"
          value={formData.emp_stat}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
        >
          <option value="Regular">Regular</option>
          <option value="Probationary">Probationary</option>
          <option value="Consultant">Consultant</option>
        </select>
      </div>
    </div>
  );
}