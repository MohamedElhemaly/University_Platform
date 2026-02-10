import { useState, useEffect } from 'react'
import {
  FileText,
  Video,
  Code,
  Download,
  Search,
  Filter,
  Heart,
  Loader2,
  FolderOpen,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const RESOURCE_TYPES = [
  { id: 'all', label: 'الكل' },
  { id: 'pdf', label: 'ملفات PDF' },
  { id: 'video', label: 'فيديوهات' },
  { id: 'code', label: 'أكواد' },
  { id: 'other', label: 'أخرى' },
]

export function StudentResources() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    if (user?.id) {
      loadResources()
    }
  }, [user])

  const loadResources = async () => {
    try {
      setLoading(true)
      const [resourcesData, materialsData] = await Promise.all([
        studentService.getResources(user.id),
        studentService.getMaterials(user.id)
      ])
      setResources(resourcesData || [])
      setMaterials(materialsData || [])
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || (resource.name || '').includes(searchQuery) || (resource.materialName || '').includes(searchQuery)
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesSubject = selectedSubject === 'all' || resource.materialId === parseInt(selectedSubject)
    return matchesSearch && matchesType && matchesSubject
  })

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return { icon: FileText, bg: 'bg-red-100', color: 'text-red-600' }
      case 'video':
        return { icon: Video, bg: 'bg-purple-100', color: 'text-purple-600' }
      case 'code':
        return { icon: Code, bg: 'bg-green-100', color: 'text-green-600' }
      default:
        return { icon: FileText, bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-600 dark:text-gray-400' }
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'pdf': return <Badge variant="danger">PDF</Badge>
      case 'video': return <Badge variant="purple">فيديو</Badge>
      case 'code': return <Badge variant="success">كود</Badge>
      default: return <Badge>{type || 'ملف'}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المصادر الدراسية</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">جميع الملفات والمراجع لموادك الدراسية</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن مصدر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">جميع المواد</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        {RESOURCE_TYPES.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedType(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Resources List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => {
          const { icon: Icon, bg, color } = getTypeIcon(resource.type)

          return (
            <Card key={resource.id} className="flex flex-col h-full">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', bg)}>
                  <Icon className={cn('w-6 h-6', color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeBadge(resource.type)}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{resource.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{resource.materialName || ''}</p>
                </div>
                <button onClick={() => toggleFavorite(resource.id)} className="p-1">
                  <Heart className={cn(
                    'w-5 h-5 transition-colors',
                    favorites.has(resource.id) ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'
                  )} />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                {resource.lectures?.title || ''}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">{resource.file_size || ''}</span>
                {resource.file_url ? (
                  <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                      تحميل
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد نتائج</h3>
          <p className="text-gray-500 dark:text-gray-400">جرب تغيير كلمات البحث أو الفلتر</p>
        </Card>
      )}
    </div>
  )
}
