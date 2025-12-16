import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { getIdTokenResult } from "firebase/auth";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, true/false = checked

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user);
          setIsAdmin(!!tokenResult.claims.admin);
        } catch (err) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  // While loading
  if (isAdmin === null) return <p>Checking permissions...</p>;

  // Redirect if not admin
  if (!isAdmin) return <Navigate to="/home" />;

  // Render children if admin
  return children;
};

export default AdminRoute;
