import React, { ReactNode } from "react";
import { Toggle } from "../../components/toggle";
import model from "../../resources/model/model";
import "./Setting.scss";

interface setting {
    title: string;
    text: ReactNode;
    name: string;
    input?: ReactNode | null;
    indent?: boolean;
}

export default function Setting({
    title,
    text,
    name,
    input = null,
    indent = false,
}: setting) {
    return (
        <div className={"setting" + (indent ? " indent" : "")}>
            <div className="left">
                <div className="title">{title}</div>
                <div className="description">{text}</div>
            </div>
            <div className="right">
                {input ? (
                    input
                ) : (
                    <Toggle
                        onChange={(v: string) =>
                            model.setSettings({ [name]: v })
                        }
                        value={model.setting(name)}

                    />
                )}
            </div>
        </div>
    );
}
