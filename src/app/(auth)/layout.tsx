const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full bg-[url(/AuthFond.jpg)] bg-cover">
      <div className="h-full w-full p-2.5 bg-black/70 flex flex-row justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default Layout;
