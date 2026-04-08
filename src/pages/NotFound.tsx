import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center space-y-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Link to="/"><Button className="font-semibold">Go Home</Button></Link>
    </div>
  </div>
);

export default NotFound;
