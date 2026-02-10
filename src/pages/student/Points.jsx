import { useState, useEffect } from 'react'
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { Avatar } from '../../components/ui/Avatar'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import { formatDate } from '../../lib/utils'

export function StudentPoints() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [pointsHistory, setPointsHistory] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [achievements, setAchievements] = useState([])
  const [allAchievements, setAllAchievements] = useState([])

  useEffect(() => {
    if (user?.id) {
      loadPointsData()
    }
  }, [user])

  const loadPointsData = async () => {
    try {
      setLoading(true)
      const data = await studentService.getPointsData(user.id)
      setPointsHistory(data.history || [])
      setLeaderboard(data.leaderboard || [])
      setAchievements(data.achievements || [])
    } catch (error) {
      console.error('Error loading points data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentUserEntry = leaderboard.find(s => s.id === user?.id)
  const studentPoints = currentUserEntry?.points ?? user?.points ?? 0
  const studentRank = leaderboard.findIndex(s => s.id === user?.id) + 1 || '-'
  const nextMilestone = Math.ceil((studentPoints + 1) / 500) * 500
  const pointsToNext = nextMilestone - studentPoints
  const earnedAchievementIds = achievements.map(a => a.achievement_id)

  const achievementIcons = [Star, Medal, Target, Zap, Trophy, Award]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">النقاط والترتيب</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">تتبع تقدمك ونافس زملاءك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center">
              <Star className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">إجمالي النقاط</p>
              <p className="text-3xl font-bold">{studentPoints}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-yellow-100 text-sm">الترتيب</p>
              <p className="text-3xl font-bold">#{studentRank}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">للمستوى التالي</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{pointsToNext}</p>
            </div>
          </div>
          <Progress value={studentPoints} max={nextMilestone} className="mt-3" />
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
                {leaderboard.length > 0 ? leaderboard.map((student, index) => {
                  const rank = index + 1
                  const isCurrentUser = student.id === user?.id
                  return (
                    <div
                      key={student.id}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-xl transition-colors',
                        isCurrentUser
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                        rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        rank === 2 ? 'bg-gray-200 text-gray-700 dark:text-gray-300' :
                        rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      )}>
                        {rank <= 3 ? (
                          <Medal className="w-4 h-4" />
                        ) : (
                          rank
                        )}
                      </div>
                      
                      <Avatar name={student.profiles?.name || 'طالب'} size="sm" />
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-medium truncate',
                          isCurrentUser ? 'text-primary-700' : 'text-gray-900 dark:text-white'
                        )}>
                          {student.profiles?.name || 'طالب'}
                          {isCurrentUser && <span className="text-primary-500 mr-2">(أنت)</span>}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.colleges?.name || ''}</p>
                      </div>
                      
                      <div className="text-left">
                        <p className={cn(
                          'font-bold',
                          isCurrentUser ? 'text-primary-600' : 'text-gray-900 dark:text-white'
                        )}>
                          {student.points}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">نقطة</p>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد بيانات في لوحة المتصدرين</p>
                )}
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
              {achievements.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((sa, index) => {
                    const IconComp = achievementIcons[index % achievementIcons.length]
                    return (
                      <div
                        key={sa.id}
                        className="aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center bg-purple-50 border border-purple-200"
                      >
                        <IconComp className="w-6 h-6 mb-1 text-purple-600" />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
                          {sa.achievements?.name || 'إنجاز'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد إنجازات بعد</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Points */}
          <Card>
            <CardHeader>
              <CardTitle>آخر النقاط المكتسبة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pointsHistory.length > 0 ? pointsHistory.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.reason}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.created_at)}</p>
                  </div>
                  <Badge variant={item.points > 0 ? 'success' : 'danger'}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </Badge>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد نقاط مكتسبة بعد</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
