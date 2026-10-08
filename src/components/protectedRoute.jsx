import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

// Route-level gate only; every privileged read/write is still
// enforced by Firestore rules on the server.
const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (active) {
          setAuthorized(false);
          setLoading(false);
        }
        return;
      }
      try {
        const adminSnap = await getDoc(doc(db, "admins", currentUser.uid));
        const admin = adminSnap.exists() ? adminSnap.data() : null;
        if (!admin || admin.status !== "Active") {
          await signOut(auth);
          if (active) setAuthorized(false);
        } else if (active) {
          setAuthorized(true);
        }
      } catch {
        if (active) setAuthorized(false);
      }
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-md px-8 py-6 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-green-700 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return authorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
