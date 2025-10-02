
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect to landing if we're exactly on the root path
    if (location.pathname === "/") {
      navigate("/landing", { replace: true });
    }
  }, [navigate, location.pathname]);

  return null;
};

export default Index;
