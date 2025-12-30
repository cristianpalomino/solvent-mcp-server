/**
 * API Client for Solvent REST API
 * Proxies requests from MCP tools to the Solvent API
 */

import type {
  ApiResponse,
  Expense,
  ExpenseWithCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
  Income,
  IncomeWithCategory,
  CreateIncomeInput,
  UpdateIncomeInput,
  Category,
  CategoryWithStats,
  CreateCategoryInput,
  UpdateCategoryInput,
  Recurring,
  RecurringWithCategory,
  CreateRecurringInput,
  UpdateRecurringInput,
  McpServerConfig,
} from './types.js'

export class ApiClient {
  private baseUrl: string
  private token: string

  constructor(config: McpServerConfig) {
    // Remove trailing slash from base URL
    this.baseUrl = config.apiUrl.replace(/\/$/, '')
    this.token = config.token
  }

  /**
   * Make an authenticated request to the API
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api/v1${path}`
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json() as Record<string, unknown>
      
      if (!response.ok) {
        return {
          success: false,
          error: (data.error as string) || `HTTP ${response.status}`,
          message: data.message as string | undefined,
        }
      }

      return data as ApiResponse<T>
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // ==================== Expenses ====================

  async listExpenses(withCategory = false): Promise<ApiResponse<Expense[] | ExpenseWithCategory[]>> {
    const query = withCategory ? '?withCategory=true' : ''
    return this.request('GET', `/expenses${query}`)
  }

  async getExpense(id: string): Promise<ApiResponse<Expense>> {
    return this.request('GET', `/expenses/${id}`)
  }

  async createExpense(input: CreateExpenseInput): Promise<ApiResponse<Expense>> {
    return this.request('POST', '/expenses', input)
  }

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<ApiResponse<Expense>> {
    return this.request('PUT', `/expenses/${id}`, input)
  }

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/expenses/${id}`)
  }

  // ==================== Incomes ====================

  async listIncomes(withCategory = false): Promise<ApiResponse<Income[] | IncomeWithCategory[]>> {
    const query = withCategory ? '?withCategory=true' : ''
    return this.request('GET', `/incomes${query}`)
  }

  async getIncome(id: string): Promise<ApiResponse<Income>> {
    return this.request('GET', `/incomes/${id}`)
  }

  async createIncome(input: CreateIncomeInput): Promise<ApiResponse<Income>> {
    return this.request('POST', '/incomes', input)
  }

  async updateIncome(id: string, input: UpdateIncomeInput): Promise<ApiResponse<Income>> {
    return this.request('PUT', `/incomes/${id}`, input)
  }

  async deleteIncome(id: string): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/incomes/${id}`)
  }

  // ==================== Categories ====================

  async listCategories(options?: {
    withStats?: boolean
    activeOnly?: boolean
    type?: 'expense' | 'income' | 'both'
  }): Promise<ApiResponse<Category[] | CategoryWithStats[]>> {
    const params = new URLSearchParams()
    if (options?.withStats) params.set('withStats', 'true')
    if (options?.activeOnly) params.set('activeOnly', 'true')
    if (options?.type) params.set('type', options.type)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request('GET', `/categories${query}`)
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.request('GET', `/categories/${id}`)
  }

  async createCategory(input: CreateCategoryInput): Promise<ApiResponse<Category>> {
    return this.request('POST', '/categories', input)
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<ApiResponse<Category>> {
    return this.request('PUT', `/categories/${id}`, input)
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/categories/${id}`)
  }

  // ==================== Recurrings ====================

  async listRecurrings(options?: {
    withCategory?: boolean
    activeOnly?: boolean
    type?: 'expense' | 'income'
  }): Promise<ApiResponse<Recurring[] | RecurringWithCategory[]>> {
    const params = new URLSearchParams()
    if (options?.withCategory) params.set('withCategory', 'true')
    if (options?.activeOnly) params.set('activeOnly', 'true')
    if (options?.type) params.set('type', options.type)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request('GET', `/recurrings${query}`)
  }

  async getRecurring(id: string): Promise<ApiResponse<Recurring>> {
    return this.request('GET', `/recurrings/${id}`)
  }

  async createRecurring(input: CreateRecurringInput): Promise<ApiResponse<Recurring>> {
    return this.request('POST', '/recurrings', input)
  }

  async updateRecurring(id: string, input: UpdateRecurringInput): Promise<ApiResponse<Recurring>> {
    return this.request('PUT', `/recurrings/${id}`, input)
  }

  async deleteRecurring(id: string): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/recurrings/${id}`)
  }
}

