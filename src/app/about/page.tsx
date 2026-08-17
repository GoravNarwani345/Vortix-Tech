import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Vortix Tech — our mission, team, and the technologies we use to build cutting-edge digital solutions.",
  keywords: ["about Vortix Tech", "software agency Karachi", "AI development team", "Next.js experts", "React Native developers"],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Vortix Tech",
    description: "Learn about Vortix Tech — our mission, team, and the technologies we use to build cutting-edge digital solutions.",
    url: "https://vortixtech.com/about",
  }
};

export default function AboutPage() {
  return <AboutContent />;
}
