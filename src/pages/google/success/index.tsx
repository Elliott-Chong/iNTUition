import React from "react";
import { useRouter } from "next/router";

const Success = () => {
  const router = useRouter();
  const { token } = router.query;
  React.useEffect(() => {
    if (!token) return;
    localStorage.setItem("token", token as string);
    setTimeout(() => {
      router.replace("/").catch((err) => console.log(err));
    }, 100);
  }, [token, router]);
  return <div>Success</div>;
};

export default Success;
