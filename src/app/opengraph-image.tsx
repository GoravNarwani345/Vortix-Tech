import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vortix Tech - AI-Powered Digital Solutions";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAF7F2",
          backgroundImage: "linear-gradient(135deg, #FAF7F2 0%, #FFFFFF 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Decorative Blur */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "60%",
            height: "80%",
            backgroundColor: "rgba(0, 102, 255, 0.05)",
            borderRadius: "50%",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "60%",
            height: "80%",
            backgroundColor: "rgba(0, 102, 255, 0.03)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Brand Name */}
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: "#1A1A1A",
              letterSpacing: "-0.05em",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
            }}
          >
            Vortix<span style={{ color: "#0066FF" }}>Tech</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: "#6B6B6B",
              marginBottom: 40,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            AI-Powered Digital Solutions
          </div>

          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 40,
            }}
          >
            {[
              "Web & Mobile Apps",
              "n8n Automation",
              "AI Integration",
            ].map((badge, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "16px 32px",
                  borderRadius: 100,
                  backgroundColor: "rgba(0, 102, 255, 0.1)",
                  color: "#0066FF",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
