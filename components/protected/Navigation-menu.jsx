import Link from "next/link";

export const NavigationMenu = ({ tabs }) => {

  return (
    <nav className="h-12 bg-white dark:bg-[#161B22] border-b flex px-6 shadow-sm overflow-x-auto">
    {tabs.map((tab) => (
      <Link
        key={tab.href}
        href={tab.href}
        className="h-full px-4 flex items-center text-[13px] font-medium border-b-[3px] border-transparent hover:text-[#0176D3] hover:border-[#0176D3] transition-all whitespace-nowrap"
      >
        {tab.label}
      </Link>
    ))}
  </nav>
  );
};