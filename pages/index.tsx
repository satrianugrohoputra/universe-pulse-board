
// Show the dashboard component as the homepage
import dynamic from "next/dynamic";
const Dashboard = dynamic(() => import("@/components/Dashboard"), { ssr: false });

export default function Home() {
  return <Dashboard />;
}
