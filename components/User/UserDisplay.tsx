"use client";

import React, { useEffect, useState } from "react";
import useUser from "../../lib/useUser";
import { User } from "@/lib/user";

type Props = {
  user: User
  onClick?: () => void;
};

export default function UserDisplay({ user, onClick }: Props) {

    if (!user) return null;

    const initials = user.name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        title={`${user.name}`}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: user.avatarColor }}
        >
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </button>
    );
  }
