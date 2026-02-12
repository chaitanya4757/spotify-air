function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex justify-center pt-20 px-6">
      <div className="
        w-full max-w-4xl
        rounded-3xl
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        shadow-xl
        p-10
      ">
        {children}
      </div>
    </div>
  );
}

export default Layout;
