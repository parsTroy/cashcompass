// API service for database operations
// This simulates API routes that would exist in a Next.js project

import { supabase } from '@/integrations/supabase/client'

// Get the current user from Supabase auth
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated')
  }
  return user
}

// API service class
export class ApiService {
  private static instance: ApiService

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  // Profile operations
  async createProfile(userId: string, email?: string) {
    const user = await getCurrentUser()
    if (user.id !== userId) {
      throw new Error('Unauthorized')
    }

    // This would be a Prisma operation in a real API route
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getProfile(userId: string) {
    const user = await getCurrentUser()
    if (user.id !== userId) {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        budget_categories(*),
        user_settings(*)
      `)
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateProfile(userId: string, data: { email?: string }) {
    const user = await getCurrentUser()
    if (user.id !== userId) {
      throw new Error('Unauthorized')
    }

    const { data: result, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  // Budget Category operations
  async createBudgetCategory(data: {
    name: string
    color?: string
    budget_amount?: number
  }) {
    const user = await getCurrentUser()
    
    const { data: result, error } = await supabase
      .from('budget_categories')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  async getBudgetCategories() {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async updateBudgetCategory(id: string, data: {
    name?: string
    color?: string
    budget_amount?: number
  }) {
    const user = await getCurrentUser()
    
    const { data: result, error } = await supabase
      .from('budget_categories')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  async deleteBudgetCategory(id: string) {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }

  // Expense operations
  async createExpense(data: {
    amount: number
    description?: string
    category_id: string
  }) {
    const user = await getCurrentUser()
    
    const { data: result, error } = await supabase
      .from('expenses')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select(`
        *,
        category:budget_categories(*)
      `)
      .single()
    
    if (error) throw error
    return result
  }

  async getExpenses() {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:budget_categories(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async getExpensesByCategory(categoryId: string) {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:budget_categories(*)
      `)
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async updateExpense(id: string, data: {
    amount?: number
    description?: string
    category_id?: string
  }) {
    const user = await getCurrentUser()
    
    const { data: result, error } = await supabase
      .from('expenses')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:budget_categories(*)
      `)
      .single()
    
    if (error) throw error
    return result
  }

  async deleteExpense(id: string) {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }

  // User Settings operations
  async createUserSettings(monthlyIncome: number) {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        monthly_income: monthlyIncome,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getUserSettings() {
    const user = await getCurrentUser()
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateUserSettings(data: { monthly_income?: number }) {
    const user = await getCurrentUser()
    
    // Try to update first
    const { data: result, error: updateError } = await supabase
      .from('user_settings')
      .update(data)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateError && updateError.code === 'PGRST116') {
      // If no record exists, create it
      const { data: newResult, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          monthly_income: data.monthly_income ?? 0,
        })
        .select()
        .single()
      
      if (createError) throw createError
      return newResult
    }
    
    if (updateError) throw updateError
    return result
  }

  // Analytics methods
  async getMonthlySpendingSummary(startDate?: Date, endDate?: Date) {
    const user = await getCurrentUser()
    
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:budget_categories(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Group by month and category
    const monthlyData = (data || []).reduce((acc, expense) => {
      const month = new Date(expense.created_at).toISOString().split('T')[0].substring(0, 7) // YYYY-MM
      const key = `${month}-${expense.category_id}`
      
      if (!acc[key]) {
        acc[key] = {
          user_id: user.id,
          category_id: expense.category_id,
          category_name: expense.category.name,
          category_color: expense.category.color,
          month: new Date(expense.created_at).toISOString(),
          total_spent: 0,
          transaction_count: 0,
        }
      }
      
      acc[key].total_spent += Number(expense.amount)
      acc[key].transaction_count += 1
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(monthlyData)
  }

  async getExpensesByMonth(year: number, month: number) {
    const user = await getCurrentUser()
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:budget_categories(*)
      `)
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Export singleton instance
export const api = ApiService.getInstance()

