import { supabase } from '@/integrations/supabase/client'
import { prisma } from '@/lib/prisma'
import type { User } from '@supabase/supabase-js'

export class DatabaseService {
  private static instance: DatabaseService
  private currentUser: User | null = null

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Authentication methods using Supabase
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (data.user) {
      this.currentUser = data.user
    }
    return { data, error }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    this.currentUser = null
    return { error }
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    this.currentUser = user
    return user
  }

  async onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user ?? null
      callback(this.currentUser)
    })
  }

  // Database methods using Prisma
  private async ensureUser() {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to perform database operations')
    }
    return this.currentUser
  }

  // Profile operations
  async createProfile(userId: string, email?: string) {
    return await prisma.profile.create({
      data: {
        id: userId,
        email,
      },
    })
  }

  async getProfile(userId: string) {
    return await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        budget_categories: true,
        user_settings: true,
      },
    })
  }

  async updateProfile(userId: string, data: { email?: string }) {
    return await prisma.profile.update({
      where: { id: userId },
      data,
    })
  }

  // Budget Category operations
  async createBudgetCategory(data: {
    name: string
    color?: string
    budget_amount?: number
  }) {
    const user = await this.ensureUser()
    return await prisma.budgetCategory.create({
      data: {
        ...data,
        user_id: user.id,
      },
    })
  }

  async getBudgetCategories() {
    const user = await this.ensureUser()
    return await prisma.budgetCategory.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    })
  }

  async updateBudgetCategory(id: string, data: {
    name?: string
    color?: string
    budget_amount?: number
  }) {
    const user = await this.ensureUser()
    return await prisma.budgetCategory.update({
      where: { 
        id,
        user_id: user.id, // Ensure user can only update their own categories
      },
      data,
    })
  }

  async deleteBudgetCategory(id: string) {
    const user = await this.ensureUser()
    return await prisma.budgetCategory.delete({
      where: { 
        id,
        user_id: user.id, // Ensure user can only delete their own categories
      },
    })
  }

  // Expense operations
  async createExpense(data: {
    amount: number
    description?: string
    category_id: string
  }) {
    const user = await this.ensureUser()
    return await prisma.expense.create({
      data: {
        ...data,
        user_id: user.id,
      },
      include: {
        category: true,
      },
    })
  }

  async getExpenses() {
    const user = await this.ensureUser()
    return await prisma.expense.findMany({
      where: { user_id: user.id },
      include: {
        category: true,
      },
      orderBy: { created_at: 'desc' },
    })
  }

  async getExpensesByCategory(categoryId: string) {
    const user = await this.ensureUser()
    return await prisma.expense.findMany({
      where: { 
        user_id: user.id,
        category_id: categoryId,
      },
      include: {
        category: true,
      },
      orderBy: { created_at: 'desc' },
    })
  }

  async updateExpense(id: string, data: {
    amount?: number
    description?: string
    category_id?: string
  }) {
    const user = await this.ensureUser()
    return await prisma.expense.update({
      where: { 
        id,
        user_id: user.id, // Ensure user can only update their own expenses
      },
      data,
      include: {
        category: true,
      },
    })
  }

  async deleteExpense(id: string) {
    const user = await this.ensureUser()
    return await prisma.expense.delete({
      where: { 
        id,
        user_id: user.id, // Ensure user can only delete their own expenses
      },
    })
  }

  // User Settings operations
  async createUserSettings(monthlyIncome: number) {
    const user = await this.ensureUser()
    return await prisma.userSettings.create({
      data: {
        user_id: user.id,
        monthly_income: monthlyIncome,
      },
    })
  }

  async getUserSettings() {
    const user = await this.ensureUser()
    return await prisma.userSettings.findUnique({
      where: { user_id: user.id },
    })
  }

  async updateUserSettings(data: { monthly_income?: number }) {
    const user = await this.ensureUser()
    return await prisma.userSettings.upsert({
      where: { user_id: user.id },
      update: data,
      create: {
        user_id: user.id,
        monthly_income: data.monthly_income ?? 0,
      },
    })
  }

  // Analytics methods
  async getMonthlySpendingSummary(startDate?: Date, endDate?: Date) {
    const user = await this.ensureUser()
    
    const whereClause: any = {
      user_id: user.id,
    }

    if (startDate) {
      whereClause.created_at = { ...whereClause.created_at, gte: startDate }
    }
    if (endDate) {
      whereClause.created_at = { ...whereClause.created_at, lte: endDate }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Group by month and category
    const monthlyData = expenses.reduce((acc, expense) => {
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
    const user = await this.ensureUser()
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    return await prisma.expense.findMany({
      where: {
        user_id: user.id,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: { created_at: 'desc' },
    })
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance()
