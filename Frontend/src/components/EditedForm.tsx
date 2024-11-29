import { useState } from "react";

function EditableForm() {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    taskId: "12345",
    taskDescription: "Complete the frontend implementation.",
    details: "This task is part of Sprint 4.",
    status: "In Progress",
  });

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-lg">
      <h2 className="text-xl font-bold mb-4">
        {editMode ? "Edit Task Details" : "Task Details"}
      </h2>

      <form className="space-y-4">
        {/* Task ID */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="font-medium">Task ID:</label>
          {editMode ? (
            <input
              type="text"
              name="taskId"
              value={formData.taskId}
              onChange={handleInputChange}
              className="col-span-2 px-4 py-2 border rounded-md"
            />
          ) : (
            <p className="col-span-2">{formData.taskId}</p>
          )}
        </div>

        {/* Task Description */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="font-medium">Description:</label>
          {editMode ? (
            <textarea
              name="taskDescription"
              value={formData.taskDescription}
              onChange={handleInputChange}
              className="col-span-2 px-4 py-2 border rounded-md"
            />
          ) : (
            <p className="col-span-2">{formData.taskDescription}</p>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="font-medium">Details:</label>
          {editMode ? (
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              className="col-span-2 px-4 py-2 border rounded-md"
            />
          ) : (
            <p className="col-span-2">{formData.details}</p>
          )}
        </div>

        {/* Status */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="font-medium">Status:</label>
          {editMode ? (
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="col-span-2 px-4 py-2 border rounded-md"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          ) : (
            <p className="col-span-2">{formData.status}</p>
          )}
        </div>
      </form>

      {/* Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={toggleEditMode}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {editMode ? "Save Changes" : "Edit"}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default EditableForm;
