import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

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

  const fetchQuestions = async () => {
    const res = await fetch(`${BACKEND}/questions`);
    const data = await res.json();
    setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

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

    const res = await fetch(`${BACKEND}/upload`, { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      alert("Uploaded successfully!");
      fetchQuestions();
    } else {
      alert(data.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this?")) return;
    await fetch(`${BACKEND}/questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4">
        <button onClick={() => navigate("/home")} className="text-blue-600 font-semibold">← Back</button>
        <button onClick={() => navigate("/signin")} className="text-red-600 font-semibold">Logout</button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Admin Upload</h1>

      <form onSubmit={handleUpload} className="bg-white p-5 rounded shadow space-y-3">
        <input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} required className="border p-2 w-full"/>
        <input placeholder="Course Title" value={title} onChange={e => setTitle(e.target.value)} required className="border p-2 w-full"/>
        <input placeholder="Course Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} required className="border p-2 w-full"/>
        
        <div className="grid grid-cols-2 gap-2">
          <select value={level} onChange={e => setLevel(e.target.value)} className="border p-2">
            {["ND1","ND2","HND1","HND2"].map(x=> <option key={x}>{x}</option>)}
          </select>
          <select value={semester} onChange={e => setSemester(e.target.value)} className="border p-2">
            {["First Semester","Second Semester"].map(x => <option key={x}>{x}</option>)}
          </select>
        </div>

        <input type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} required className="border p-2 w-full"/>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Uploading..." : "Upload PDF"}</button>
      </form>

      <h2 className="text-xl font-bold mt-6">Uploaded Questions</h2>
      <ul className="mt-3 space-y-2">
        {questions.map(q => (
          <li key={q.id} className="p-3 border rounded flex justify-between items-center">
            <div><strong>{q.title}</strong> — {q.course_code} ({q.year})</div>
            <div className="flex gap-2">
              <a href={q.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
              <a href={q.pdf_url} download className="text-green-600 underline">Download</a>
              <button onClick={() => handleDelete(q.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
