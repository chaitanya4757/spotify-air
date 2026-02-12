import Layout from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./components/Dashboard";

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <Layout>
      {!user ? (
        <button
          onClick={login}
          className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-semibold transition"
        >
          Login with Spotify
        </button>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-4">
            Welcome {user.displayName}
          </h2>

          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg mb-8"
          >
            Logout
          </button>

          <Dashboard />
        </>
      )}
    </Layout>
  );
}

export default App;
