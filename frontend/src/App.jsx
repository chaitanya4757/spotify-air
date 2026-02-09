import { useAuth } from "./hooks/useAuth";
import Dashboard from "./components/Dashboard";

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!user ? (
        <button onClick={login}>Login with Spotify</button>
      ) : (
        <>
          <h2>Welcome {user.displayName}</h2>
          <button onClick={logout}>Logout</button>
          <Dashboard />
        </>
      )}
    </div>
  );
}

export default App;
