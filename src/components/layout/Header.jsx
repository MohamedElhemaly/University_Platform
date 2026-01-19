import { Menu, Bell, Search } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { currentStudent, currentProfessor } from '../../data/mockData'

export function Header({ userType, onMenuClick }) {
  const user = userType === 'professor' ? currentProfessor : currentStudent

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 w-64 lg:w-80">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث..."
              className="bg-transparent border-none outline-none text-sm flex-1 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">
                {userType === 'professor' ? user.title : user.faculty}
              </p>
            </div>
            <Avatar name={user.name} size="md" />
          </div>
        </div>
      </div>
    </header>
  )
}
