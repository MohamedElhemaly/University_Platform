import { useState } from 'react'
import {
  Calendar,
  Briefcase,
  BookOpen,
  Headphones,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Filter,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { activities } from '../../data/mockData'
import { formatDate, getRelativeTime } from '../../lib/utils'

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: null },
  { id: 'event', label: 'فعاليات', icon: Calendar },
  { id: 'internship', label: 'تدريب', icon: Briefcase },
  { id: 'course', label: 'دورات', icon: BookOpen },
  { id: 'podcast', label: 'بودكاست', icon: Headphones },
  { id: 'tool', label: 'أدوات', icon: Wrench },
]

export function StudentActivities() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter(a => a.type === activeFilter)

  const getIcon = (type) => {
    switch (type) {
      case 'event': return Calendar
      case 'internship': return Briefcase
      case 'course': return BookOpen
      case 'podcast': return Headphones
      case 'tool': return Wrench
      default: return Calendar
    }
  }

  const getIconBg = (type) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-600'
      case 'internship': return 'bg-green-100 text-green-600'
      case 'course': return 'bg-purple-100 text-purple-600'
      case 'podcast': return 'bg-orange-100 text-orange-600'
      case 'tool': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'فعالية': return <Badge variant="info">{category}</Badge>
      case 'تدريب': return <Badge variant="success">{category}</Badge>
      case 'دورة': return <Badge variant="purple">{category}</Badge>
      case 'بودكاست': return <Badge variant="warning">{category}</Badge>
      case 'أداة': return <Badge variant="default">{category}</Badge>
      default: return <Badge>{category}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الأنشطة والفرص</h1>
        <p className="text-gray-500 mt-1">فعاليات ودورات وفرص تدريبية معتمدة من الجامعة</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeFilter === cat.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.icon && <cat.icon className="w-4 h-4" />}
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map((activity) => {
          const Icon = getIcon(activity.type)
          
          return (
            <Card key={activity.id} className="flex flex-col h-full">
              {/* Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Icon className="w-12 h-12 text-gray-400" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryBadge(activity.category)}
                  {activity.approved && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">معتمد</span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{activity.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  {activity.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                  )}
                  {activity.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>آخر موعد: {formatDate(activity.deadline)}</span>
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                  {activity.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration}</span>
                    </div>
                  )}
                  {activity.company && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{activity.company}</span>
                    </div>
                  )}
                  {activity.instructor && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{activity.instructor}</span>
                    </div>
                  )}
                  {activity.host && (
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      <span>{activity.host}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button className="w-full" variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  {activity.type === 'internship' ? 'تقديم طلب' : 
                   activity.type === 'event' ? 'التسجيل' :
                   activity.type === 'course' ? 'الالتحاق' :
                   activity.type === 'podcast' ? 'استماع' : 'فتح'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredActivities.length === 0 && (
        <Card className="p-12 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد نتائج</h3>
          <p className="text-gray-500">جرب تغيير الفلتر لرؤية المزيد من الأنشطة</p>
        </Card>
      )}
    </div>
  )
}
