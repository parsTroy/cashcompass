
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { BudgetCategory } from "@/pages/Dashboard";

const PRESET_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", 
  "#84cc16", "#f97316", "#ec4899", "#ef4444", "#14b8a6", 
  "#a855f7", "#22c55e", "#6366f1", "#d946ef"
];

const BudgetManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", budgetAmount: 0 });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  // Load data from localStorage (in a real app, this would come from Supabase)
  useEffect(() => {
    const savedCategories = localStorage.getItem('budgetCategories');
    const savedIncome = localStorage.getItem('monthlyIncome');
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedIncome) {
      setMonthlyIncome(Number(savedIncome));
    }
  }, []);

  const saveCategories = (updatedCategories: BudgetCategory[]) => {
    setCategories(updatedCategories);
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
  };

  const handleAddCategory = () => {
    if (!newCategory.name || newCategory.budgetAmount <= 0) return;

    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    const category: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      budgetAmount: newCategory.budgetAmount,
      spent: 0,
      color: randomColor
    };

    saveCategories([...categories, category]);
    setNewCategory({ name: "", budgetAmount: 0 });
    setShowAddDialog(false);
  };

  const handleEditCategory = (category: BudgetCategory) => {
    const updatedCategories = categories.map(cat =>
      cat.id === category.id ? category : cat
    );
    saveCategories(updatedCategories);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    saveCategories(updatedCategories);
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const remainingIncome = monthlyIncome - totalBudget;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manage Budget Categories</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Budget Overview */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">${monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Budgeted</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${remainingIncome >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${remainingIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Category */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="dark:text-white">Categories</CardTitle>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName" className="dark:text-gray-200">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Gym Membership"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryBudget" className="dark:text-gray-200">Monthly Budget</Label>
                      <Input
                        id="categoryBudget"
                        type="number"
                        value={newCategory.budgetAmount || ""}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, budgetAmount: Number(e.target.value) }))}
                        placeholder="0"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddCategory} disabled={!newCategory.name || newCategory.budgetAmount <= 0}>
                        Add Category
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No categories yet. Add your first category to get started!
                </p>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                    {editingCategory?.id === category.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <Input
                          type="number"
                          value={editingCategory.budgetAmount || ""}
                          onChange={(e) => setEditingCategory(prev => prev ? { ...prev, budgetAmount: Number(e.target.value) } : null)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <div className="flex gap-2 md:col-span-2">
                          <Button size="sm" onClick={() => handleEditCategory(editingCategory)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="font-medium dark:text-white">{category.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              ${category.budgetAmount.toLocaleString()} budgeted • ${category.spent.toLocaleString()} spent
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={category.spent > category.budgetAmount ? "destructive" : "secondary"}>
                            {category.budgetAmount > 0 ? Math.round((category.spent / category.budgetAmount) * 100) : 0}% used
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCategory(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">Delete Category</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-300">
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone and will remove all associated expenses.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:text-gray-300">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetManagement;
