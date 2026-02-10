import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock data mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Auth helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, metadata = {}) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
    return data
  },

  // Sign in with email/password
  signIn: async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  getSession: async () => {
    if (!supabase) return null
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Get current user
  getUser: async () => {
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Update password
  updatePassword: async (newPassword) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
    return data
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Generic query builder
  from: (table) => {
    if (!supabase) throw new Error('Supabase not configured')
    return supabase.from(table)
  },

  // Select with filters
  select: async (table, columns = '*', filters = {}) => {
    if (!supabase) throw new Error('Supabase not configured')
    let query = supabase.from(table).select(columns)
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Insert record
  insert: async (table, data) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    if (error) throw error
    return result
  },

  // Update record
  update: async (table, data, filters = {}) => {
    if (!supabase) throw new Error('Supabase not configured')
    let query = supabase.from(table).update(data)
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data: result, error } = await query.select()
    if (error) throw error
    return result
  },

  // Delete record
  delete: async (table, filters = {}) => {
    if (!supabase) throw new Error('Supabase not configured')
    let query = supabase.from(table).delete()
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { error } = await query
    if (error) throw error
  },

  // RPC call
  rpc: async (functionName, params = {}) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.rpc(functionName, params)
    if (error) throw error
    return data
  }
}

// Storage helpers
export const storage = {
  // Upload file
  upload: async (bucket, path, file, options = {}) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      })
    if (error) throw error
    return data
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    if (!supabase) return null
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  // Download file
  download: async (bucket, path) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.storage.from(bucket).download(path)
    if (error) throw error
    return data
  },

  // Delete file
  remove: async (bucket, paths) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.storage.from(bucket).remove(paths)
    if (error) throw error
  },

  // List files
  list: async (bucket, path = '', options = {}) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.storage.from(bucket).list(path, options)
    if (error) throw error
    return data
  }
}

// Realtime helpers
export const realtime = {
  // Subscribe to table changes
  subscribe: (table, callback, filters = {}) => {
    if (!supabase) return { unsubscribe: () => {} }
    
    let channel = supabase.channel(`${table}_changes`)
    
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        ...filters
      },
      callback
    )
    
    channel.subscribe()
    
    return {
      unsubscribe: () => channel.unsubscribe()
    }
  },

  // Subscribe to user's notifications
  subscribeToNotifications: (userId, callback) => {
    return realtime.subscribe('notifications', callback, {
      filter: `user_id=eq.${userId}`
    })
  }
}

export default supabase
