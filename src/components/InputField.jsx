// src/components/InputField.jsx
import React from "react";

const InputField = ({ label, type, value, onChange, placeholder = "" }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="mt-1 block w-full p-3 border border-gray-300 rounded-xl
                 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
    />
  </label>
);

export default InputField;
