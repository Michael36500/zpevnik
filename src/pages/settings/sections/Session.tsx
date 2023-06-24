import React from "react";
import model from "../../../resources/model/model";
import { Setting } from "../SettingsPage";

export default function SessionSettings() {
  return (
    <div className="section">
      <div className="session">
        {model.state.session.online ? (
          <>
            You are in a session. Code: {model.state.session.code}
            <div className="buttons">
              <div
                className="button"
                onClick={() => {
                  model.leaveSession();
                }}
              >
                {model.state.session.leader ? "End Session" : "Leave Session"}
              </div>
            </div>
          </>
        ) : (
          <>
            You are currently not in a session.
            <div className="buttons">
              <div
                className="button"
                onClick={() => {
                  model.startSession();
                }}
              >
                Start Session
              </div>
              <div
                className="button"
                onClick={() => {
                  model.joinSession();
                }}
              >
                Join Session
              </div>
            </div>
          </>
        )}
      </div>

      <Setting
        name="autofitOnSessionUpdate"
        title="Auto-fit"
        text="Automatically auto-fit song on session update"
      />
    </div>
  );
}
