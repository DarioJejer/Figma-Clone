"use client";

import React, { useEffect, useState } from "react";
import useUser from "../../lib/useUser";
import { User } from "@/lib/user";

type Props = {
  remoteUsers: Record<string, User>;
  onClick?: () => void;
};

export default function UserDisplay({ remoteUsers }: Props) {
  
    return (
      <div className="hidden md:flex items-center">
            <div className="flex" style={{ marginLeft: `${Math.max(0, Object.keys(remoteUsers).length - 1) * 12}px` }}>
              {Object.values(remoteUsers)
                .slice(0, 6)
                .map((u, idx) => (
                  <div
                      key={u.id}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs"
                      style={{
                        backgroundColor: u.avatarColor,
                        marginLeft: idx === 0 ? 0 : "-12px",
                        zIndex: Object.keys(remoteUsers).length - idx,
                      }}
                      title={u.name}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>
            {Object.keys(remoteUsers).length > 6 && (
              <div className="text-xs text-gray-500 ml-2">+{Object.keys(remoteUsers).length - 6}</div>
            )}
          </div>
    );
  }
