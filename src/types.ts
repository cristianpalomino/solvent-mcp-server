/**
 * Types for the Solvent MCP Server
 */

// API Response wrapper
export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  message?: string
}

// Expense types
export type Expense = {
  id: string
  user_id: string
  category_id: string
  recurring_id: string | null
  amount: string
  currency: string
  description: string | null
  date: string
  created_at: string
  updated_at: string
}

export type ExpenseWithCategory = Expense & {
  category_name: string
  category_color: string | null
}

export type CreateExpenseInput = {
  amount: string
  currency: string
  category_id: string
  date: string
  description?: string
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>

// Income types
export type Income = {
  id: string
  user_id: string
  category_id: string
  recurring_id: string | null
  amount: string
  currency: string
  description: string | null
  date: string
  created_at: string
  updated_at: string
}

export type IncomeWithCategory = Income & {
  category_name: string
  category_color: string | null
}

export type CreateIncomeInput = {
  amount: string
  currency: string
  category_id: string
  date: string
  description?: string
}

export type UpdateIncomeInput = Partial<CreateIncomeInput>

// Category types
export type TransactionType = 'expense' | 'income' | 'both'

export type Category = {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  color: string | null
  type: TransactionType
  is_active: boolean
  created_at: string
}

export type CategoryWithStats = Category & {
  parent_category_name: string | null
  number_of_children: number
  number_of_expenses: number
  number_of_incomes: number
}

export type CreateCategoryInput = {
  name: string
  type: TransactionType
  color?: string
  parent_id?: string
  is_active?: boolean
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

// Recurring types
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type Recurring = {
  id: string
  user_id: string
  category_id: string
  type: TransactionType
  amount: string
  currency: string
  description: string | null
  frequency: RecurringFrequency
  interval: number
  day_of_week: number | null
  day_of_month: number | null
  month_of_year: number | null
  start_date: string
  end_date: string | null
  next_occurrence: string
  last_generated: string | null
  is_active: boolean
  created_at: string
}

export type RecurringWithCategory = Recurring & {
  category_name: string
  category_color: string | null
  generated_count: number
}

export type CreateRecurringInput = {
  amount: string
  currency: string
  category_id: string
  type: 'expense' | 'income'
  frequency: RecurringFrequency
  start_date: string
  interval?: number
  day_of_week?: number
  day_of_month?: number
  month_of_year?: number
  end_date?: string
  description?: string
  is_active?: boolean
}

export type UpdateRecurringInput = Partial<CreateRecurringInput>

// MCP Server configuration
export type McpServerConfig = {
  apiUrl: string
  token: string
}

