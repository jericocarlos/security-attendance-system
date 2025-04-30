export default function FormFields({ formData, handleChange }) {
    return (
      <>
        {/* Ashima ID */}
        <div className="col-span-1">
          <label className="block text-gray-700 mb-2">Ashima ID</label>
          <input
            type="text"
            name="ashima_id"
            value={formData.ashima_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
  
        {/* Name */}
        <div className="col-span-1">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
  
        {/* Department */}
        <div className="col-span-1">
          <label className="block text-gray-700 mb-2">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
  
        {/* Position */}
        <div className="col-span-1">
          <label className="block text-gray-700 mb-2">Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
  
        {/* RFID Tag */}
        <div className="col-span-1">
          <label className="block text-gray-700 mb-2">RFID Tag</label>
          <input
            type="text"
            name="rfid_tag"
            value={formData.rfid_tag}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
  
        {/* Employee Status */}
        <div className="col-span-1">
          <label className="block text-gray-700 mb-2">Employee Status</label>
          <select
            name="emp_stat"
            value={formData.emp_stat}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="Regular">Regular</option>
            <option value="Probationary">Probationary</option>
            <option value="Consultant">Consultant</option>
          </select>
        </div>
  
        {/* Status */}
        <div className="col-span-1">
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </>
    );
  }