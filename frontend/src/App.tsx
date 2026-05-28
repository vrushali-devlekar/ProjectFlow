import React, { useEffect, useState } from "react";
import { useBoardStore } from "./store/boardStore";
import Header from "./components/Header";
import StatsBar from "./components/StatsBar";
import FilterBar from "./components/FilterBar";
import Board from "./components/Board";
import TaskModal from "./components/TaskModal";
import LoginPage, { type AuthUser } from "./components/LoginPage";

export default function App() {
  const { init, loading, stats, members, columns, setSelectedTask } = useBoardStore();
  const [showNewTask, setShowNewTask] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!authUser && !!localStorage.getItem("auth_token");

  useEffect(() => {
    if (isAuthenticated) {
      init();
    }
  }, [isAuthenticated]);

  function handleLogin(token: string, user: AuthUser) {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    setAuthUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthUser(null);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center animate-pulse2">
          <div className="w-5 h-5 rounded-md bg-accent" />
        </div>
        <p className="text-sm text-gray-500 font-mono animate-pulse2">Loading ProjectFlow...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <Header onAddTask={() => setShowNewTask(true)} user={authUser} onLogout={handleLogout} />
      <StatsBar stats={stats} />
      <FilterBar members={members} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <Board />
      </div>

      {showNewTask && (
        <TaskModal
          task={null}
          members={members}
          columns={columns}
          onClose={() => setShowNewTask(false)}
        />
      )}
    </div>
  );
}
