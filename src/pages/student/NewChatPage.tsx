import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NewChatPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/student", { replace: true });
  }, [navigate]);

  return null;
}
