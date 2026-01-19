import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { Avatar } from '../../components/ui/Avatar'
import { currentStudent, leaderboard } from '../../data/mockData'
import { cn } from '../../lib/utils'

export function StudentPoints() {
  const nextMilestone = 2500
  const pointsToNext = nextMilestone - currentStudent.points

  const achievements = [
    { id: 1, title: 'أول اختبار', description: 'أكمل أول اختبار', icon: Star, earned: true },
    { id: 2, title: 'متفوق', description: 'احصل على 90% في 3 اختبارات', icon: Medal, earned: true },
    { id: 3, title: 'مثابر', description: 'أكمل 10 محاضرات متتالية', icon: Target, earned: true },
    { id: 4, title: 'فضولي', description: 'اسأل 20 سؤال', icon: Zap, earned: false },
    { id: 5, title: 'قائد', description: 'ادخل أفضل 10', icon: Trophy, earned: false },
    { id: 6, title: 'خبير', description: 'أكمل جميع اختبارات مادة', icon: Award, earned: false },
  ]

  const pointsHistory = [
    { id: 1, title: 'اختبار أنماط التصميم', points: 45, date: '2026-01-10' },
    { id: 2, title: 'اختبار SQL المتقدم', points: 52, date: '2026-01-08' },
    { id: 3, title: 'سؤال مميز', points: 10, date: '2026-01-07' },
    { id: 4, title: 'حضور محاضرة', points: 5, date: '2026-01-05' },
    { id: 5, title: 'اختبار الوحدة الأولى', points: 48, date: '2026-01-03' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">النقاط والترتيب</h1>
        <p className="text-gray-500 mt-1">تتبع تقدمك ونافس زملاءك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="w-7 h-7" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">إجمالي النقاط</p>
              <p className="text-3xl font-bold">{currentStudent.points}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <p className="text-yellow-100 text-sm">الترتيب</p>
              <p className="text-3xl font-bold">#{currentStudent.rank}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">للمستوى التالي</p>
              <p className="text-3xl font-bold text-gray-900">{pointsToNext}</p>
            </div>
          </div>
          <Progress value={currentStudent.points} max={nextMilestone} className="mt-3" />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle>لوحة المتصدرين</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((student, index) => (
                  <div
                    key={student.rank}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl transition-colors',
                      student.isCurrentUser
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      student.rank === 2 ? 'bg-gray-200 text-gray-700' :
                      student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {student.rank <= 3 ? (
                        <Medal className="w-4 h-4" />
                      ) : (
                        student.rank
                      )}
                    </div>
                    
                    <Avatar name={student.name} size="sm" />
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium truncate',
                        student.isCurrentUser ? 'text-primary-700' : 'text-gray-900'
                      )}>
                        {student.name}
                        {student.isCurrentUser && <span className="text-primary-500 mr-2">(أنت)</span>}
                      </p>
                      <p className="text-sm text-gray-500">{student.faculty}</p>
                    </div>
                    
                    <div className="text-left">
                      <p className={cn(
                        'font-bold',
                        student.isCurrentUser ? 'text-primary-600' : 'text-gray-900'
                      )}>
                        {student.points}
                      </p>
                      <p className="text-xs text-gray-500">نقطة</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <CardTitle>الإنجازات</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={cn(
                      'aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center',
                      achievement.earned
                        ? 'bg-purple-50 border border-purple-200'
                        : 'bg-gray-50 opacity-50'
                    )}
                  >
                    <achievement.icon className={cn(
                      'w-6 h-6 mb-1',
                      achievement.earned ? 'text-purple-600' : 'text-gray-400'
                    )} />
                    <p className="text-xs font-medium text-gray-700 line-clamp-2">
                      {achievement.title}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Points */}
          <Card>
            <CardHeader>
              <CardTitle>آخر النقاط المكتسبة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pointsHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <Badge variant="success">+{item.points}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
