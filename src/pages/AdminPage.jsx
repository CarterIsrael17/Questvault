import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Use environment variable for backend
const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

const AdminPage = () => {
  const navigate = useNavigate();

  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [level, setLevel] = useState("ND1");
  const [semester, setSemester] = useState("First Semester");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch uploaded questions
  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${BACKEND}/questions`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching questions. Check console.");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Choose a PDF file");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("course_code", courseCode);
    formData.append("department", department);
    formData.append("level", level);
    formData.append("semester", semester);
    formData.append("year", year);

    try {
      const res = await fetch(`${BACKEND}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      alert("Uploaded successfully!");
      fetchQuestions();
      setFile(null); // Reset file input
      e.target.reset();
    } catch (error) {
      console.error(error);
      alert("Upload failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this?")) return;
    try {
      const res = await fetch(`${BACKEND}/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchQuestions();
    } catch (error) {
      console.error(error);
      alert("Failed to delete. See console.");
    }
  };

  // Navigation
  const handleBack = () => navigate("/home");
  const handleLogout = () => navigate("/signin"); // ✅ goes to SignIn page

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4">
        <button onClick={handleBack} className="text-blue-600 font-semibold">
          ← Back
        </button>
        <button onClick={handleLogout} className="text-red-600 font-semibold">
          Logout
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Admin Upload</h1>

      <form onSubmit={handleUpload} className="bg-white p-5 rounded shadow space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <select className="border p-2" value={level} onChange={(e) => setLevel(e.target.value)}>
            {["ND1", "ND2", "HND1", "HND2"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select className="border p-2" value={semester} onChange={(e) => setSemester(e.target.value)}>
            {["First Semester", "Second Semester"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>

      <h2 className="text-xl font-bold mt-6">Uploaded Questions</h2>
      <ul className="mt-3 space-y-2">
        {questions.map((q) => (
          <li key={q.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <strong>{q.title}</strong> — {q.course_code} ({q.year})
            </div>
            <div className="flex gap-2">
              {q.pdf_url && (
                <>
                  <a href={q.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                  <a href={q.pdf_url} download className="text-green-600 underline">
                    Download
                  </a>
                </>
              )}
              <button onClick={() => handleDelete(q.id)} className="text-red-600">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
