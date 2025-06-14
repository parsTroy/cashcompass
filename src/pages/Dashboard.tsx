import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, TrendingUp, PiggyBank, Moon, Sun, LogOut, Settings, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CategorySetup from "@/components/CategorySetup";
import ExpenseEntry from "@/components/ExpenseEntry";

export interface BudgetCategory {
  id: string;
  name: string;
  budgetAmount: number;
  spent: number;
  color: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [incomeSet, setIncomeSet] = useState(false);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [categoriesSet, setCategoriesSet] = useState(false);
  const [showExpenseEntry, setShowExpenseEntry] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Load user data from Supabase
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load user settings (monthly income)
      const { data: settings } = await supabase
        .from('user_settings')
        .select('monthly_income')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        setMonthlyIncome(settings.monthly_income);
        setIncomeSet(settings.monthly_income > 0);
      }

      // Load budget categories
      const { data: budgetCategories } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id);

      if (budgetCategories && budgetCategories.length > 0) {
        // Load expenses for each category to calculate spent amounts
        const { data: expenses } = await supabase
          .from('expenses')
          .select('category_id, amount')
          .eq('user_id', user.id);

        const expensesByCategory = expenses?.reduce((acc, expense) => {
          acc[expense.category_id] = (acc[expense.category_id] || 0) + Number(expense.amount);
          return acc;
        }, {} as Record<string, number>) || {};

        const categoriesWithSpent = budgetCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          budgetAmount: Number(cat.budget_amount),
          spent: expensesByCategory[cat.id] || 0,
          color: cat.color
        }));

        setCategories(categoriesWithSpent);
        setCategoriesSet(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleIncomeSubmit = async () => {
    if (monthlyIncome > 0 && user) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .update({ monthly_income: monthlyIncome })
          .eq('user_id', user.id);

        if (error) throw error;

        setIncomeSet(true);
        toast({
          title: "Success",
          description: "Monthly income saved successfully!"
        });
      } catch (error) {
        console.error('Error saving income:', error);
        toast({
          title: "Error",
          description: "Failed to save monthly income. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCategoriesComplete = async (selectedCategories: BudgetCategory[]) => {
    if (!user) return;

    try {
      // Save categories to Supabase
      const categoriesToInsert = selectedCategories.map(cat => ({
        name: cat.name,
        budget_amount: cat.budgetAmount,
        color: cat.color,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('budget_categories')
        .insert(categoriesToInsert);

      if (error) throw error;

      setCategories(selectedCategories);
      setCategoriesSet(true);
      toast({
        title: "Success",
        description: "Budget categories saved successfully!"
      });
    } catch (error) {
      console.error('Error saving categories:', error);
      toast({
        title: "Error",
        description: "Failed to save budget categories. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addExpense = async (categoryId: string, amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          amount: amount
        });

      if (error) throw error;

      // Update local state
      const updatedCategories = categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, spent: cat.spent + amount }
          : cat
      );
      setCategories(updatedCategories);

      toast({
        title: "Success",
        description: "Expense added successfully!"
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!incomeSet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto pt-12">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center">
              <div className="flex justify-between items-center mb-4">
                <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
              <CardTitle className="text-2xl dark:text-white">Welcome to CashCompass</CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Let's start by setting your monthly income</p>
              {user?.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Signed in as: {user.email}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="income" className="dark:text-gray-200">Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your monthly income"
                  value={monthlyIncome || ""}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <Button 
                onClick={handleIncomeSubmit} 
                className="w-full"
                disabled={monthlyIncome <= 0}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!categoriesSet) {
    return (
      <CategorySetup 
        monthlyIncome={monthlyIncome}
        onComplete={handleCategoriesComplete}
      />
    );
  }

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = monthlyIncome - totalBudget;
  const actualRemaining = monthlyIncome - totalSpent;
  const budgetUtilization = monthlyIncome > 0 ? (totalBudget / monthlyIncome) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold text-gray-900 dark:text-white hover:bg-transparent p-0"
          >
            CashCompass
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="text-gray-600 dark:text-gray-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/budget-management')}
              className="text-gray-600 dark:text-gray-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Budget
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Badge variant="secondary" className="text-sm dark:bg-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 dark:text-gray-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Budget Allocation Overview */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <TrendingUp className="w-5 h-5" />
              Budget Allocation Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Income Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">${monthlyIncome.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Budgeted</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalBudget.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{budgetUtilization.toFixed(1)}% of income</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Available for Savings</p>
                  <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${remainingBudget.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {monthlyIncome > 0 ? ((remainingBudget / monthlyIncome) * 100).toFixed(1) : 0}% of income
                  </p>
                </div>
              </div>

              {/* Visual Budget Allocation */}
              <div>
                <div className="flex justify-between text-sm mb-2 dark:text-gray-300">
                  <span>Budget Allocation</span>
                  <span>{budgetUtilization.toFixed(1)}% allocated</span>
                </div>
                <Progress value={Math.min(budgetUtilization, 100)} className="h-3 mb-2" />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Budgeted: ${totalBudget.toLocaleString()}</span>
                  <span>Income: ${monthlyIncome.toLocaleString()}</span>
                </div>
              </div>

              {/* Savings Potential Alert */}
              {remainingBudget > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <PiggyBank className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Great! You have ${remainingBudget.toLocaleString()} available for savings or investments
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      That's {((remainingBudget / monthlyIncome) * 100).toFixed(1)}% of your income you can save!
                    </p>
                  </div>
                </div>
              )}

              {remainingBudget < 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Warning: You're budgeting ${Math.abs(remainingBudget).toLocaleString()} more than your income
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Consider reducing some budget categories to avoid overspending
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress Overview */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <DollarSign className="w-5 h-5" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">${monthlyIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Budget</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${totalSpent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Remaining</p>
                <p className={`text-2xl font-bold ${actualRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${actualRemaining.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => {
            const percentage = category.budgetAmount > 0 ? (category.spent / category.budgetAmount) * 100 : 0;
            const isOverBudget = percentage > 100;
            
            return (
              <Card key={category.id} className="relative dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm dark:text-gray-300">
                      <span>Spent: ${category.spent.toLocaleString()}</span>
                      <span>Budget: ${category.budgetAmount.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {percentage.toFixed(1)}% used
                      </span>
                      {isOverBudget && (
                        <Badge variant="destructive" className="text-xs">
                          Over Budget
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Expense Button */}
        <div className="fixed bottom-6 right-6">
          <Button 
            size="lg" 
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => setShowExpenseEntry(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Expense Entry Modal */}
        {showExpenseEntry && (
          <ExpenseEntry
            categories={categories}
            onAddExpense={addExpense}
            onClose={() => setShowExpenseEntry(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
