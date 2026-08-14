import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Vortix Tech — our mission, team, and the technologies we use to build cutting-edge digital solutions.",
};

export default function AboutPage() {
  return <AboutContent />;
}
