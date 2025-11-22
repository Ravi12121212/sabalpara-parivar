import React from "react";

// Displays the PDF in an iframe with a download button at the bottom.
// The file lives in /public so it can be referenced directly by "/Sabalpara-Parivar.pdf".
const InvitationPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <img
          src={"../../Sabalpara-Parivar_page-0001.jpg"}
          alt="Invitation"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <a
          href={"/Sabalpara-Parivar.pdf"}
          download
          className="btn btn-primary"
          style={{ textDecoration: "none" }}
        >
          Download PDF
        </a>
        <a
          href={"https://www.google.com/maps/search/jeliba+farm+kiran+chowk%5D/@21.2121668,72.8807322,18z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D"}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ textDecoration: "none" }}
        >
          Open location
        </a>
        {/* <a
          href="/signup"
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Sign Up
        </a> */}
        <a
          href="/previous-result"
          className="btn btn-ghost"
          style={{ textDecoration: 'none' }}
        >
          ગત વર્ષનું પરિણામ
        </a>
      </div>
    </div>
  );
};

export default InvitationPage;
