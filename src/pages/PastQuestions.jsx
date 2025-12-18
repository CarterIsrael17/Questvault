// src/pages/PastQuestions.jsx
import React, { useEffect, useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND = "https://questvault-2.onrender.com";

const PastQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [level, setLevel] = useState("All");
  const [semester, setSemester] = useState("All");
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${BACKEND}/questions`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const filtered = questions.filter((q) => {
    const levelMatch = level === "All" || q.level === level;
    const semesterMatch = semester === "All" || q.semester === semester;
    const deptMatch = department === "All" || q.department === department;
    const yearMatch = year === "All" || String(q.year) === year;

    const s = search.toLowerCase();
    const searchMatch =
      !s ||
      q.title?.toLowerCase().includes(s) ||
      q.course_code?.toLowerCase().includes(s) ||
      q.department?.toLowerCase().includes(s);

    return levelMatch && semesterMatch && deptMatch && yearMatch && searchMatch;
  });

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (questions.length === 0)
    return <p className="p-6 text-center">No past questions available.</p>;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-10">
      {/* Header */}
      <header className="sticky top-0 bg-white flex items-center p-4 shadow-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border rounded-full shadow"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">
          Past Questions
        </h1>
        <div className="w-8" />
      </header>

      {/* Filters */}
      <div className="sticky top-16 bg-white p-4 shadow-sm z-10">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, code, or department"
            className="w-full pl-11 pr-4 py-3 border rounded-full focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="border p-2 rounded flex-1">
            {["All", "ND1", "ND2", "HND1", "HND2"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>

          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border p-2 rounded flex-1">
            {["All", "First Semester", "Second Semester"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>

          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border p-2 rounded flex-1">
            {["All", "Computer Engineering Technology", "Electrical Engineering Technology", "Civil Engineering Technology"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} className="border p-2 rounded flex-1">
            {["All", "2021", "2022", "2023", "2024", "2025"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-4 px-4 mt-4">
        {filtered.length > 0 ? (
          filtered.map((q) => (
            <div
              key={q.id}
              className="border-2 border-dashed border-blue-400 rounded-2xl p-1"
            >
              <div className="bg-white rounded-xl p-4 space-y-1">
                <p className="text-sm"><strong>Department:</strong> {q.department}</p>
                <p className="text-sm"><strong>Course Title:</strong> {q.title}</p>
                <p className="text-sm"><strong>Course Code:</strong> {q.course_code}</p>
                <p className="text-sm"><strong>Level:</strong> {q.level}</p>

                {/* ✅ YEAR DISPLAYED HERE */}
                <p className="text-sm text-blue-600 font-semibold">
                  Year: {q.year}
                </p>

                {q.pdf_url && (
                  <div className="flex justify-end gap-2 mt-3">
                    <a
                      href={q.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg"
                    >
                      View PDF
                    </a>
                    <a
                      href={q.pdf_url}
                      download
                      className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No questions found.</p>
        )}
      </div>
    </div>
  );
};

export default PastQuestions;
