export default function FormFields({ formData, handleChange }) {
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
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Name */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Department */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Department</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Position */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Position</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
        />
      </div>

      {/* RFID Tag */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">RFID Tag</label>
        <input
          type="text"
          name="rfid_tag"
          value={formData.rfid_tag}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
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

      {/* Status */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-2 font-medium">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}