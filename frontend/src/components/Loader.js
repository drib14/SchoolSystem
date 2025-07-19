import React from "react";
import "../App.css";

function Loader() {
    return (
        <div className="loader-container">
            <div className="logo-spin-border">
                <img src="/assets/school-logo.png" alt="ISCP Logo" className="logo-img" />
            </div>
        </div>
    );
}

export default Loader;
