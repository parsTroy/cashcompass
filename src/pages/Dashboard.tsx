import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, TrendingUp, PiggyBank } from "lucide-react";
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
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [incomeSet, setIncomeSet] = useState(false);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [categoriesSet, setCategoriesSet] = useState(false);
  const [showExpenseEntry, setShowExpenseEntry] = useState(false);

  const handleIncomeSubmit = () => {
    if (monthlyIncome > 0) {
      setIncomeSet(true);
    }
  };

  const handleCategoriesComplete = (selectedCategories: BudgetCategory[]) => {
    setCategories(selectedCategories);
    setCategoriesSet(true);
  };

  const addExpense = (categoryId: string, amount: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, spent: cat.spent + amount }
        : cat
    ));
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = monthlyIncome - totalBudget;
  const actualRemaining = monthlyIncome - totalSpent;
  const budgetUtilization = monthlyIncome > 0 ? (totalBudget / monthlyIncome) * 100 : 0;

  if (!incomeSet) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-12">
          <Card>
            <CardHeader className="text-center">
              <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Welcome to BudgetBloom</CardTitle>
              <p className="text-gray-600">Let's start by setting your monthly income</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="income">Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your monthly income"
                  value={monthlyIncome || ""}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="text-lg"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">BudgetBloom</h1>
          <Badge variant="secondary" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Budget Allocation Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Budget Allocation Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Income Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600">${monthlyIncome.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Budgeted</p>
                  <p className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{budgetUtilization.toFixed(1)}% of income</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Available for Savings</p>
                  <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    ${remainingBudget.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {monthlyIncome > 0 ? ((remainingBudget / monthlyIncome) * 100).toFixed(1) : 0}% of income
                  </p>
                </div>
              </div>

              {/* Visual Budget Allocation */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget Allocation</span>
                  <span>{budgetUtilization.toFixed(1)}% allocated</span>
                </div>
                <Progress value={Math.min(budgetUtilization, 100)} className="h-3 mb-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Budgeted: ${totalBudget.toLocaleString()}</span>
                  <span>Income: ${monthlyIncome.toLocaleString()}</span>
                </div>
              </div>

              {/* Savings Potential Alert */}
              {remainingBudget > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <PiggyBank className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Great! You have ${remainingBudget.toLocaleString()} available for savings or investments
                    </p>
                    <p className="text-xs text-green-600">
                      That's {((remainingBudget / monthlyIncome) * 100).toFixed(1)}% of your income you can save!
                    </p>
                  </div>
                </div>
              )}

              {remainingBudget < 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Warning: You're budgeting ${Math.abs(remainingBudget).toLocaleString()} more than your income
                    </p>
                    <p className="text-xs text-red-600">
                      Consider reducing some budget categories to avoid overspending
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">${monthlyIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600">${totalSpent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${actualRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
              <Card key={category.id} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${category.spent.toLocaleString()}</span>
                      <span>Budget: ${category.budgetAmount.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
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
