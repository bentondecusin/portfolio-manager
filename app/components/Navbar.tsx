import React from 'react'

const Navbar = () => {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-background border-b border-border shadow-sm">
      {/* website Name */}
      <div className="text-2xl font-bold tracking-tight select-none">Overcoded</div>
      {/* User Avatar */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border shadow">
          <img src="/WechatIMG54.jpg" alt="User Avatar" className="w-full h-full object-cover"/>
        </div>
      </div>
    </nav>
  )
}

export default Navbar